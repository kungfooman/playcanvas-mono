import { BLEND_NORMAL, CHUNKAPI_1_65, SHADOW_VSM16 as SHADOW_TYPE, SHADOWUPDATE_REALTIME as SHADOWUPDATE, Entity, Layer, StandardMaterial } from 'playcanvas';

const endPS = `
    litArgs_opacity = mix(light0_shadowIntensity, 0.0, shadow0);
    gl_FragColor.rgb = vec3(0.0);
`;

class ShadowCatcher {
    layer = undefined;
    material = undefined;
    plane = undefined;
    light = undefined;
    sceneRoot = undefined;
    camera = undefined;

    constructor(app, camera, parent, sceneRoot) {
        // create and add the shadow layer
        this.layer = new Layer({
            name: 'Shadow Layer'
        });

        const layers = app.scene.layers;
        const worldLayer = layers.getLayerByName('World');
        const idx = layers.getTransparentIndex(worldLayer);
        layers.insert(this.layer, idx + 1);

        // create shadow catcher material
        this.material = new StandardMaterial();
        this.material.useSkybox = false;
        this.material.blendType = BLEND_NORMAL;
        this.material.depthWrite = false;
        this.material.diffuse.set(0, 0, 0);
        this.material.specular.set(0, 0, 0);
        this.material.chunks = {
            APIVersion: CHUNKAPI_1_65,
            endPS: endPS
        };
        this.material.update();

        // create shadow catcher geometry
        this.plane = new Entity('ShadowPlane');
        this.plane.addComponent('render', {
            type: 'plane',
            castShadows: false,
            material: this.material
        });

        // create shadow catcher light
        this.light = new Entity('ShadowLight');
        this.light.addComponent('light', {
            type: 'directional',
            castShadows: true,
            normalOffsetBias: 0,
            shadowBias: 0.0,
            shadowResolution: 1024,
            shadowType: SHADOW_TYPE,
            shadowUpdateMode: SHADOWUPDATE,
            vsmBlurSize: 64,
            enabled: true,
            shadowIntensity: 0.4
        });

        parent.addChild(this.plane);
        parent.addChild(this.light);
        this.plane.render.layers = [this.layer.id];
        this.light.light.layers = [this.layer.id];

        // add the shadow layer to the camera
        camera.layers = camera.layers.concat([this.layer.id]);

        this.sceneRoot = sceneRoot;
        this.camera = camera;
    }

    /**
     * @param {Entity} entity
     * @returns {void}
     */
    onEntityAdded(entity) {
        entity.findComponents('render').forEach((component) => {
            this.layer.shadowCasters = this.layer.shadowCasters.concat(component.meshInstances);
        });
    }

    /**
     * @param {Entity} entity
     * @returns {void}
     */
    onEntityRemoved(entity) {
        entity.findComponents('render').forEach((component) => {
            this.layer.shadowCasters = this.layer.shadowCasters.filter((meshInstance) => {
                return component.meshInstances.indexOf(meshInstance) === -1;
            });
        });
    }

    /**
     * @param {BoundingBox} sceneBounds
     * @returns {void}
     */
    onUpdate(sceneBounds) {
        const bound = sceneBounds;
        const center = bound.center;
        const len = Math.sqrt(bound.halfExtents.x * bound.halfExtents.x + bound.halfExtents.z * bound.halfExtents.z);

        this.plane.setLocalScale(len * 4, 1, len * 4);
        this.plane.setPosition(center.x, bound.getMin().y, center.z);

        this.light.light.shadowDistance = this.camera.camera._farClip;
    }

    set enabled(enabled) {
        this.layer.enabled = enabled;
        this.light.enabled = enabled;
    }

    get enabled() {
        return this.layer.enabled;
    }

    set intensity(value) {
        this.light.light.shadowIntensity = value;
    }

    get intensity() {
        return this.light.light.shadowIntensity;
    }
}

export { ShadowCatcher };
