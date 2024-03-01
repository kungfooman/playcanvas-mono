import { XRSPACE_LOCAL, XRSPACE_VIEWER, XRTRACKABLE_POINT, XRTRACKABLE_PLANE, XRTRACKABLE_MESH, XRTYPE_AR, BoundingBox, EventHandler, Vec3 } from 'playcanvas';

const vec = new Vec3();
const vec2 = new Vec3();
const translation = new Vec3();
const forward = new Vec3();

// modulo dealing with negative numbers
/**
 * @param {number} n
 * @param {number} m
 * @returns {number}
 */
const mod = (n, m) => ((n % m) + m) % m;

// create an invisible dom element for capturing pointer input
// rotate the model with two finger tap and twist
/**
 * @param {XRObjectPlacementController} controller
 * @returns {HTMLDivElement}
 */
const createRotateInput = (controller) => {
    const touches = new Map();
    let baseAngle = 0;
    let angle = 0;

    const eventDefault = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onPointerDown = (e) => {
        eventDefault(e);

        touches.set(e.pointerId, {
            start: { x: e.clientX, y: e.clientY },
            previous: { x: e.clientX, y: e.clientY },
            current: { x: e.clientX, y: e.clientY }
        });

        if (controller.rotating) {
            if (touches.size === 1) {
                controller.rotating = false;
            }
        }
        else {
            controller.rotating = touches.size > 1;
        }
    };

    const onPointerMove = (e) => {
        eventDefault(e);

        const touch = touches.get(e.pointerId);
        if (touch) {
            touch.previous.x = touch.current.x;
            touch.previous.y = touch.current.y;
            touch.current.x = e.clientX;
            touch.current.y = e.clientY;
        }

        if (touches.size === 2) {
            const ids = Array.from(touches.keys());
            const a = touches.get(ids[0]);
            const b = touches.get(ids[1]);

            const initialAngle = Math.atan2(b.start.y - a.start.y, b.start.x - a.start.x);
            const currentAngle = Math.atan2(b.current.y - a.current.y, b.current.x - a.current.x);
            angle = currentAngle - initialAngle;

            controller.events.fire('xr:rotate', ((baseAngle + angle) * -180) / Math.PI);
        }
    };

    const onPointerUp = (e) => {
        eventDefault(e);

        if (touches.size === 2) {
            baseAngle += angle;
        }

        touches.delete(e.pointerId);
    };

    const dom = document.createElement('div');
    dom.style.position = 'fixed';
    dom.style.top = '0';
    dom.style.left = '0';
    dom.style.width = '100%';
    dom.style.height = '100%';
    dom.style.touchAction = 'none';
    dom.style.display = 'none';
    document.body.appendChild(dom);

    controller.events.on('xr:started', () => {
        dom.style.display = 'block';
        dom.addEventListener('pointerdown', onPointerDown);
        dom.addEventListener('pointermove', onPointerMove);
        dom.addEventListener('pointerup', onPointerUp);
    });

    controller.events.on('xr:ended', () => {
        dom.style.display = 'none';
        dom.removeEventListener('pointerdown', onPointerDown);
        dom.removeEventListener('pointermove', onPointerMove);
        dom.removeEventListener('pointerup', onPointerUp);
    });

    return dom;
};

// create a dom element and controller for launching and exiting xr mode
/**
 * @param {XRObjectPlacementController} controller
 * @returns {void}
 */
const createUI = (controller) => {
    const dom = document.createElement('img');
    dom.src = controller.options.startArImgSrc;
    dom.style.position = 'fixed';
    dom.style.right = '20px';
    dom.style.top = '20px';
    dom.style.width = '36px';
    dom.style.height = '36px';
    dom.style.opacity = '100%';
    dom.style.display = 'none';
    document.body.appendChild(dom);

    // disable button during xr mode transitions
    let enabled = true;

    controller.events.on('xr:available', (available) => {
        dom.style.display = available ? 'block' : 'none';
    });

    controller.events.on('xr:started', () => {
        enabled = true;
        dom.src = controller.options.stopArImgSrc;
        controller.options.xr.domOverlay.root.appendChild(dom);
    });

    controller.events.on('xr:ended', () => {
        enabled = true;
        dom.src = controller.options.startArImgSrc;
        document.body.appendChild(dom);
    });

    dom.addEventListener('click', () => {
        if (enabled) {
            enabled = false;
            if (controller.active) {
                controller.end();
            }
            else {
                controller.start();
            }
        }
    });
};

// helper tween class
class Tween {
    value = undefined;
    source = undefined;
    target = undefined;
    /** @default 0 */
    timer = 0;
    /** @default 0 */
    transitionTime = 0;

    constructor(value) {
        this.value = value;
        this.source = { ...value };
        this.target = { ...value };
    }

    /**
     * @param {any} target
     * @param {number} [transitionTime=0.25]
     * @returns {void}
     */
    goto(target, transitionTime = 0.25) {
        if (transitionTime === 0) {
            Tween.copy(this.value, target);
        }
        Tween.copy(this.source, this.value);
        Tween.copy(this.target, target);
        this.timer = 0;
        this.transitionTime = transitionTime;
    }

    /**
     * @param {number} deltaTime
     * @returns {void}
     */
    update(deltaTime) {
        if (this.timer < this.transitionTime) {
            this.timer = Math.min(this.timer + deltaTime, this.transitionTime);
            Tween.lerp(this.value, this.source, this.target, Tween.quintic(this.timer / this.transitionTime));
        }
        else {
            Tween.copy(this.value, this.target);
        }
    }

    /**
     * @static
     * @param {number} n
     * @returns {number}
     */
    static quintic(n) {
        return Math.pow(n - 1, 5) + 1;
    }

    /**
     * @static
     * @param {any} target
     * @param {any} source
     * @returns {void}
     */
    static copy(target, source) {
        Object.keys(target).forEach((key) => {
            target[key] = source[key];
        });
    }

    /**
     * @static
     * @param {any} target
     * @param {any} a
     * @param {any} b
     * @param {number} t
     * @returns {void}
     */
    static lerp(target, a, b, t) {
        Object.keys(target).forEach((key) => {
            target[key] = a[key] + t * (b[key] - a[key]);
        });
    }
}

// register for callback events from the xr manager to smoothly transition and move the model
/**
 * @param {XRObjectPlacementController} controller
 * @returns {void}
 */
const createModelHandler = (controller) => {
    const xr = controller.options.xr;
    const events = controller.events;

    const pos = new Tween({ x: 0, y: 0, z: 0 });
    const rot = new Tween({ x: 0, y: 0, z: 0 });
    const scale = new Tween({ scale: 1 });
    const lerpSpeed = 0.25;

    let hovering = true;
    const hoverPos = new Vec3();

    const bound = new BoundingBox();
    let meshInstances;

    const updateBound = () => {
        if (meshInstances.length) {
            bound.copy(meshInstances[0].aabb);
            for (let i = 1; i < meshInstances.length; ++i) {
                bound.add(meshInstances[i].aabb);
            }
        }
    };

    events.on('xr:start', () => {
        hovering = true;

        meshInstances = controller.options.content.findComponents('render')
            .map((render) => {
            return render.meshInstances;
        })
            .flat()
            .concat(controller.options.content.findComponents('gsplat')
            .map((gsplat) => {
            return gsplat.instance.meshInstance;
        }));

        updateBound();

        const halfExtents = bound.halfExtents;
        hoverPos.set(0, -halfExtents.y, -halfExtents.length() * 4);
    });

    events.on('xr:initial-place', (position) => {
        const mat = xr.views.list[0]._viewInvMat;
        mat.transformPoint(hoverPos, vec);
        mat.getEulerAngles(vec2);
        pos.goto({ x: vec.x, y: vec.y, z: vec.z }, 0);
        rot.goto({ x: vec2.x, y: vec2.y, z: vec2.z }, 0);
        scale.goto({ scale: 0.55 }, 0);

        rot.goto({ x: 0, y: 0, z: 0 }, lerpSpeed);
        pos.goto({ x: position.x, y: position.y, z: position.z }, lerpSpeed);
        hovering = false;
    });

    events.on('xr:place', (position) => {
        pos.goto({ x: position.x, y: position.y, z: position.z }, lerpSpeed);
    });

    events.on('xr:rotate', (angle) => {
        angle = mod(angle, 360);
        rot.goto({ x: 0, y: angle, z: 0 }, lerpSpeed);
        // wrap source rotation to be within -180...180 degrees of target
        rot.source.y = angle - 180 + mod(rot.source.y - angle + 180, 360);
    });

    events.on('xr:ended', () => {
        controller.options.content.setLocalPosition(0, 0, 0);
        controller.options.content.setLocalEulerAngles(0, 0, 0);
    });

    xr.app.on('frameupdate', (ms) => {
        const dt = ms / 1000;
        pos.update(dt);
        rot.update(dt);
        scale.update(dt);
    });

    xr.on('update', () => {
        const xr = controller.options.xr;

        if (!xr.views.list.length) {
            return;
        }

        const mat = xr.views.list[0]._viewInvMat;
        const contentRoot = controller.options.content;

        if (hovering) {
            mat.transformPoint(hoverPos, vec);
            mat.getEulerAngles(vec2);

            contentRoot.setLocalPosition(vec.x, vec.y, vec.z);
            contentRoot.setLocalEulerAngles(vec2.x, vec2.y, vec2.z);
            contentRoot.setLocalScale(1, 1, 1);
        }
        else {
            contentRoot.setLocalPosition(pos.value.x, pos.value.y, pos.value.z);
            contentRoot.setLocalEulerAngles(rot.value.x, rot.value.y, rot.value.z);
            contentRoot.setLocalScale(scale.value.scale, scale.value.scale, scale.value.scale);
        }

        // calculate scene bounds
        updateBound();

        // update clipping planes
        const boundCenter = bound.center;
        const boundRadius = bound.halfExtents.length();

        mat.getZ(forward);
        mat.getTranslation(translation);

        vec.sub2(boundCenter, translation);
        const dist = -vec.dot(forward);

        const far = dist + boundRadius;
        const near = Math.max(0.0001, dist < boundRadius ? far / 1024 : dist - boundRadius);

        // @ts-ignore
        xr._setClipPlanes(near / 1.5, far * 1.5);

        controller.events.fire('xr:update');
    });
};

class XRObjectPlacementController {
    options = undefined;
    dom = undefined;
    /** @default new EventHandler() */
    events = new EventHandler();
    /** @default false */
    active = false;
    /** @default false */
    rotating = false;

    constructor(options) {
        this.options = options;

        const xr = options.xr;

        // create the rotation controller
        xr.domOverlay.root = createRotateInput(this);

        // create dom
        if (this.options.showUI) {
            createUI(this);
        }

        createModelHandler(this);

        // perform an asynchronous ray intersection test given a view-space ray
        // returns a handle used to cancel the hit test
        const hitTest = (resultCallback) => {
            xr.hitTest.start({
                spaceType: XRSPACE_VIEWER,
                entityTypes: [XRTRACKABLE_POINT, XRTRACKABLE_PLANE, XRTRACKABLE_MESH],
                callback: (err, hitTestSource) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        hitTestSource.on('result', (position) => {
                            resultCallback(position);
                            hitTestSource.remove();
                        });
                    }
                }
            });
        };

        // handle xr mode availability change
        xr.on('available:' + XRTYPE_AR, (available) => {
            this.events.fire('xr:available', available);
        });

        // handle xr mode starting
        xr.on('start', () => {
            this.active = true;
            this.events.fire('xr:started');

            // initial placement hit test
            hitTest((position) => {
                this.events.fire('xr:initial-place', position);

                // vibrate on initial placement
                navigator?.vibrate(10);

                // register for touchscreen hit test
                xr.hitTest.start({
                    profile: 'generic-touchscreen',
                    entityTypes: [XRTRACKABLE_POINT, XRTRACKABLE_PLANE, XRTRACKABLE_MESH],
                    callback: (err, hitTestSource) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            hitTestSource.on('result', (position) => {
                                if (!this.rotating) {
                                    this.events.fire('xr:place', position);
                                }
                            });
                        }
                    }
                });
            });
        });

        // handle xr mode ending
        xr.on('end', () => {
            this.active = false;
            this.events.fire('xr:ended');
        });
    }

    get available() {
        return this.options.xr.isAvailable(XRTYPE_AR);
    }

    // request to start the xr session
    /**
     * @returns {void}
     */
    start() {
        if (!this.available || this.active) {
            return;
        }
        this.events.fire('xr:start');
        this.options.xr.start(this.options.camera.camera, XRTYPE_AR, XRSPACE_LOCAL, {
            callback: (err) => {
                if (err) {
                    console.log(err);
                }
            }
        });
    }

    // end the ar session
    /**
     * @returns {void}
     */
    end() {
        this.options.xr.end();
    }
}

export { XRObjectPlacementController };

/** @typedef {Object} TweenValue */

/**
 * @typedef {Object} XRObjectPlacementOptions
 * @property {XrManager} xr
 * @property {Entity} camera
 * @property {Entity} content
 * @property {boolean} showUI
 * @property {any} startArImgSrc
 * @property {any} stopArImgSrc 
 */
