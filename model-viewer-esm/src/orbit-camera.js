import { EVENT_MOUSEDOWN, EVENT_MOUSEUP, EVENT_MOUSEMOVE, EVENT_MOUSEWHEEL, MOUSEBUTTON_LEFT, MOUSEBUTTON_MIDDLE, MOUSEBUTTON_RIGHT, EVENT_TOUCHSTART, EVENT_TOUCHEND, EVENT_TOUCHCANCEL, EVENT_TOUCHMOVE, KEY_W, KEY_S, KEY_A, KEY_D, KEY_Q, KEY_E, KEY_F, KEY_SHIFT, math, Vec2, Vec3 } from 'playcanvas';

class SmoothedValue {
    value = undefined;
    start = undefined;
    target = undefined;
    transitionTime = undefined;
    timer = undefined;

    constructor(value, transitionTime = 0.25) {
        this.value = value.clone();
        this.start = value.clone();
        this.target = value.clone();
        this.transitionTime = transitionTime;
        this.timer = 0;
    }

    /**
     * @param {any} target
     * @returns {void}
     */
    goto(target) {
        this.timer = 0;
        this.start.copy(this.value);
        this.target.copy(target);
    }

    /**
     * @param {any} value
     * @returns {void}
     */
    snapto(value) {
        this.timer = this.transitionTime;
        this.target.copy(value);
    }

    /**
     * @param {number} deltaTime
     * @returns {void}
     */
    update(deltaTime) {
        if (this.timer < this.transitionTime) {
            this.timer = Math.min(this.timer + deltaTime, this.transitionTime);
            const n = this.timer / this.transitionTime;
            // const t = Math.sin(n * Math.PI / 2.0);        // sinosidal
            // const t = n * (2 - n);                        // quadratic
            // const t = 1 - --n * n * n * n;                // quartic
            const t = Math.pow(n - 1, 5) + 1; // quintic
            this.value.lerp(this.start, this.target, t);
        }
        else {
            this.value.copy(this.target);
        }
    }
}

const vec = new Vec3();
const fromWorldPoint = new Vec3();
const toWorldPoint = new Vec3();
const worldDiff = new Vec3();

class OrbitCamera {
    cameraNode = undefined;
    focalPoint = undefined;
    azimElevDistance = undefined;

    sceneSize = undefined;
    /** @default 0.05 */
    zoomMin = 0.05;
    /** @default 10 */
    zoomMax = 10;

    constructor(cameraNode, transitionTime) {
        this.cameraNode = cameraNode;
        this.focalPoint = new SmoothedValue(new Vec3(0, 0, 0), transitionTime);
        this.azimElevDistance = new SmoothedValue(new Vec3(0, 0, 1), transitionTime);
    }

    /**
     * @param {Vec3} vec
     * @param {Vec3} azimElevDistance
     * @returns {void}
     */
    vecToAzimElevDistance(vec, azimElevDistance) {
        const distance = vec.length();
        const azim = Math.atan2(-vec.x / distance, -vec.z / distance) * math.RAD_TO_DEG;
        const elev = Math.asin(vec.y / distance) * math.RAD_TO_DEG;
        azimElevDistance.set(azim, elev, distance / this.sceneSize);
    }

    // calculate the current forward vector
    /**
     * @param {Vec3} result
     * @returns {void}
     */
    calcForwardVec(result) {
        const ex = this.azimElevDistance.value.y * math.DEG_TO_RAD;
        const ey = this.azimElevDistance.value.x * math.DEG_TO_RAD;
        const s1 = Math.sin(-ex);
        const c1 = Math.cos(-ex);
        const s2 = Math.sin(-ey);
        const c2 = Math.cos(-ey);
        result.set(-c1 * s2, s1, c1 * c2);
    }

    /**
     * @param {number} deltaTime
     * @returns {void}
     */
    update(deltaTime) {
        // update underlying values
        this.focalPoint.update(deltaTime);
        this.azimElevDistance.update(deltaTime);

        const aed = this.azimElevDistance.value;
        this.calcForwardVec(vec);
        vec.mulScalar(Math.max(this.zoomMin, Math.min(this.zoomMax, aed.z)) * this.sceneSize);
        vec.add(this.focalPoint.value);

        this.cameraNode.setLocalPosition(vec);
        this.cameraNode.setLocalEulerAngles(aed.y, aed.x, 0);
    }
}

// OrbitCameraInputMouse

class OrbitCameraInputMouse {
    app = undefined;
    orbitCamera = undefined;
    /** @default 0.3 */
    orbitSensitivity = 0.3;
    /** @default 0.4 */
    distanceSensitivity = 0.4;
    /** @default false */
    lookButtonDown = false;
    /** @default false */
    panButtonDown = false;
    /** @default new Vec2() */
    lastPoint = new Vec2();

    /**
     * @default () => {
     *         this.onMouseOut();
     *     }
     */
    onMouseOutFunc = () => {
        this.onMouseOut();
    };

    constructor(app, orbitCamera) {
        this.app = app;
        this.orbitCamera = orbitCamera;

        this.app.mouse.on(EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.on(EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.on(EVENT_MOUSEWHEEL, this.onMouseWheel, this);

        // Listen to when the mouse travels out of the window
        window.addEventListener('mouseout', this.onMouseOutFunc, false);

        // Disabling the context menu stops the browser displaying a menu when
        // you right-click the page
        this.app.mouse.disableContextMenu();
    }

    /**
     * @returns {void}
     */
    destroy() {
        this.app.mouse.off(EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.off(EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.off(EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.off(EVENT_MOUSEWHEEL, this.onMouseWheel, this);

        window.removeEventListener('mouseout', this.onMouseOutFunc, false);
    }

    /**
     * @param {MouseEvent} screenPoint
     * @returns {void}
     */
    pan(screenPoint) {
        const orbitCamera = this.orbitCamera;

        // For panning to work at any zoom level, we use screen point to world projection
        // to work out how far we need to pan the pivotEntity in world space
        const camera = orbitCamera.cameraNode.camera;
        const distance = orbitCamera.azimElevDistance.value.z * orbitCamera.sceneSize;

        camera.screenToWorld(screenPoint.x, screenPoint.y, distance, fromWorldPoint);
        camera.screenToWorld(this.lastPoint.x, this.lastPoint.y, distance, toWorldPoint);

        worldDiff.sub2(toWorldPoint, fromWorldPoint);
        worldDiff.add(orbitCamera.focalPoint.target);

        orbitCamera.focalPoint.goto(worldDiff);
    }


    /**
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseDown(event) {
        switch (event.button) {
            case MOUSEBUTTON_LEFT:
                this.lookButtonDown = true;
                break;
            case MOUSEBUTTON_MIDDLE:
            case MOUSEBUTTON_RIGHT:
                this.panButtonDown = true;
                break;
        }
    }

    /**
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseUp(event) {
        switch (event.button) {
            case MOUSEBUTTON_LEFT:
                this.lookButtonDown = false;
                break;
            case MOUSEBUTTON_MIDDLE:
            case MOUSEBUTTON_RIGHT:
                this.panButtonDown = false;
                break;
        }
    }

    /**
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseMove(event) {
        if (this.lookButtonDown) {
            vec.copy(this.orbitCamera.azimElevDistance.target);
            vec.y -= event.dy * this.orbitSensitivity;
            vec.x -= event.dx * this.orbitSensitivity;
            this.orbitCamera.azimElevDistance.goto(vec);
        }
        else if (this.panButtonDown) {
            this.pan(event);
        }

        this.lastPoint.set(event.x, event.y);
    }

    /**
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseWheel(event) {
        const orbitCamera = this.orbitCamera;
        vec.copy(orbitCamera.azimElevDistance.target);
        vec.z -= event.wheelDelta * -2 * this.distanceSensitivity * (vec.z * 0.1);
        vec.z = Math.max(orbitCamera.zoomMin, Math.min(orbitCamera.zoomMax, vec.z));
        this.orbitCamera.azimElevDistance.goto(vec);
        event.event.preventDefault();
    }

    /**
     * @returns {void}
     */
    onMouseOut() {
        this.lookButtonDown = false;
        this.panButtonDown = false;
    }
}

// OrbitCameraInputTouch

class OrbitCameraInputTouch {
    app = undefined;
    orbitCamera = undefined;
    /** @default 0.3 */
    orbitSensitivity = 0.3;
    /** @default 0.4 */
    distanceSensitivity = 0.4;
    /** @default new Vec2() */
    lastTouchPoint = new Vec2();
    /** @default new Vec2() */
    lastPinchMidPoint = new Vec2();
    /** @default 0 */
    lastPinchDistance = 0;
    /** @default new Vec2() */
    pinchMidPoint = new Vec2();

    constructor(app, orbitCamera) {
        this.app = app;
        this.orbitCamera = orbitCamera;

        if (this.app.touch) {
            // Use the same callback for the touchStart, touchEnd and touchCancel events as they
            // all do the same thing which is to deal the possible multiple touches to the screen
            this.app.touch.on(EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
            this.app.touch.on(EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
            this.app.touch.on(EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);

            this.app.touch.on(EVENT_TOUCHMOVE, this.onTouchMove, this);
        }
    }

    /**
     * @returns {void}
     */
    destroy() {
        this.app.touch.off(EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
        this.app.touch.off(EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
        this.app.touch.off(EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);
        this.app.touch.off(EVENT_TOUCHMOVE, this.onTouchMove, this);
    }

    /**
     * @param {Touch} pointA
     * @param {Touch} pointB
     * @returns {number}
     */
    getPinchDistance(pointA, pointB) {
        // Return the distance between the two points
        const dx = pointA.x - pointB.x;
        const dy = pointA.y - pointB.y;
        return Math.sqrt((dx * dx) + (dy * dy));
    }

    /**
     * @param {Touch} pointA
     * @param {Touch} pointB
     * @param {Vec2} result
     * @returns {void}
     */
    calcMidPoint(pointA, pointB, result) {
        result.set(pointB.x - pointA.x, pointB.y - pointA.y);
        result.mulScalar(0.5);
        result.x += pointA.x;
        result.y += pointA.y;
    }

    /**
     * @param {TouchEvent} event
     * @returns {void}
     */
    onTouchStartEndCancel(event) {
        // We only care about the first touch for camera rotation. As the user touches the screen,
        // we stored the current touch position
        const touches = event.touches;
        if (touches.length === 1) {
            this.lastTouchPoint.set(touches[0].x, touches[0].y);
        }
        else if (touches.length === 2) {
            // If there are 2 touches on the screen, then set the pinch distance
            this.lastPinchDistance = this.getPinchDistance(touches[0], touches[1]);
            this.calcMidPoint(touches[0], touches[1], this.lastPinchMidPoint);
        }
    }

    /**
     * @param {Vec2} midPoint
     * @returns {void}
     */
    pan(midPoint) {
        const orbitCamera = this.orbitCamera;

        // For panning to work at any zoom level, we use screen point to world projection
        // to work out how far we need to pan the pivotEntity in world space
        const camera = orbitCamera.cameraNode.camera;
        const distance = orbitCamera.azimElevDistance.target.z * orbitCamera.sceneSize;

        camera.screenToWorld(midPoint.x, midPoint.y, distance, fromWorldPoint);
        camera.screenToWorld(this.lastPinchMidPoint.x, this.lastPinchMidPoint.y, distance, toWorldPoint);

        worldDiff.sub2(toWorldPoint, fromWorldPoint);
        worldDiff.add(orbitCamera.focalPoint.target);

        orbitCamera.focalPoint.goto(worldDiff);
    }

    /**
     * @param {TouchEvent} event
     * @returns {void}
     */
    onTouchMove(event) {
        const orbitCamera = this.orbitCamera;
        const pinchMidPoint = this.pinchMidPoint;

        const aed = orbitCamera.azimElevDistance.target.clone();

        // We only care about the first touch for camera rotation. Work out the difference moved since the last event
        // and use that to update the camera target position
        const touches = event.touches;
        if (touches.length === 1) {
            const touch = touches[0];
            aed.y -= (touch.y - this.lastTouchPoint.y) * this.orbitSensitivity;
            aed.x -= (touch.x - this.lastTouchPoint.x) * this.orbitSensitivity;
            orbitCamera.azimElevDistance.goto(aed);
            this.lastTouchPoint.set(touch.x, touch.y);
        }
        else if (touches.length === 2) {
            // Calculate the difference in pinch distance since the last event
            const currentPinchDistance = this.getPinchDistance(touches[0], touches[1]);
            const diffInPinchDistance = currentPinchDistance - this.lastPinchDistance;
            this.lastPinchDistance = currentPinchDistance;

            aed.z -= (diffInPinchDistance * this.distanceSensitivity * 0.1) * (aed.z * 0.1);
            aed.z = Math.max(orbitCamera.zoomMin, Math.min(orbitCamera.zoomMax, aed.z));
            orbitCamera.azimElevDistance.goto(aed);

            // Calculate pan difference
            this.calcMidPoint(touches[0], touches[1], pinchMidPoint);
            this.pan(pinchMidPoint);
            this.lastPinchMidPoint.copy(pinchMidPoint);
        }
    }
}

// fly controls
class OrbitCameraInputKeyboard {
    // forward, back, left, right, up, down
    app = undefined;
    orbitCamera = undefined;
    /** @default [false, false, false, false, false, false] */
    controls = [false, false, false, false, false, false];
    /** @default false */
    shift = false;

    constructor(app, orbitCamera) {
        this.app = app;
        this.orbitCamera = orbitCamera;

        app.keyboard.on('keydown', (event) => {
            switch (event.key) {
                case KEY_W:
                    this.controls[0] = true;
                    break;
                case KEY_S:
                    this.controls[1] = true;
                    break;
                case KEY_A:
                    this.controls[2] = true;
                    break;
                case KEY_D:
                    this.controls[3] = true;
                    break;
                case KEY_Q:
                    this.controls[4] = true;
                    break;
                case KEY_E:
                    this.controls[5] = true;
                    break;
                case KEY_F:
                    this.app.fire('focuscamera', true);
                    break;
            }
        });

        app.keyboard.on('keyup', (event) => {
            switch (event.key) {
                case KEY_W:
                    this.controls[0] = false;
                    break;
                case KEY_S:
                    this.controls[1] = false;
                    break;
                case KEY_A:
                    this.controls[2] = false;
                    break;
                case KEY_D:
                    this.controls[3] = false;
                    break;
                case KEY_Q:
                    this.controls[4] = false;
                    break;
                case KEY_E:
                    this.controls[5] = false;
                    break;
            }
        });
    }

    /**
     * @param {number} deltaTime
     * @param {number} sceneSize
     * @returns {void}
     */
    update(deltaTime, sceneSize) {
        const move = (dir, amount) => {
            vec.copy(dir).mulScalar(deltaTime * sceneSize * amount);
            vec.add(this.orbitCamera.focalPoint.value);
            this.orbitCamera.focalPoint.goto(vec);
        };

        const speed = this.app.keyboard.isPressed(KEY_SHIFT) ? 10 : 2;

        if (this.controls[0]) {
            move(this.orbitCamera.cameraNode.forward, speed);
        }
        if (this.controls[1]) {
            move(this.orbitCamera.cameraNode.forward, -speed);
        }
        if (this.controls[2]) {
            move(this.orbitCamera.cameraNode.right, -speed);
        }
        if (this.controls[3]) {
            move(this.orbitCamera.cameraNode.right, speed);
        }
        if (this.controls[4]) {
            move(this.orbitCamera.cameraNode.up, speed);
        }
        if (this.controls[5]) {
            move(this.orbitCamera.cameraNode.up, -speed);
        }
    }
}

export { OrbitCamera, OrbitCameraInputMouse, OrbitCameraInputTouch, OrbitCameraInputKeyboard };
