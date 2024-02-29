import { Lightmapper, AppBase, AppOptions, AnimComponentSystem, RenderComponentSystem, CameraComponentSystem, LightComponentSystem, RenderHandler, AnimClipHandler, AnimStateGraphHandler, BinaryHandler, ContainerHandler, CubemapHandler, TextureHandler, XrManager, GSplatComponentSystem, GSplatHandler } from 'playcanvas';

/** @extends AppBase */
class App extends AppBase {
    constructor(canvas, options) {
        super(canvas);

        const appOptions = new AppOptions();

        appOptions.graphicsDevice = options.graphicsDevice;
        this.addComponentSystems(appOptions);
        this.addResourceHandles(appOptions);

        appOptions.elementInput = options.elementInput;
        appOptions.keyboard = options.keyboard;
        appOptions.mouse = options.mouse;
        appOptions.touch = options.touch;
        appOptions.gamepads = options.gamepads;

        appOptions.scriptPrefix = options.scriptPrefix;
        appOptions.assetPrefix = options.assetPrefix;
        appOptions.scriptsOrder = options.scriptsOrder;

        // @ts-ignore
        appOptions.lightmapper = Lightmapper;
        // @ts-ignore
        appOptions.xr = XrManager;

        this.init(appOptions);
    }

    /**
     * @param {AppOptions} appOptions
     * @returns {void}
     */
    addComponentSystems(appOptions) {
        appOptions.componentSystems = [
            AnimComponentSystem,
            RenderComponentSystem,
            CameraComponentSystem,
            LightComponentSystem,
            GSplatComponentSystem
        ];
    }

    /**
     * @param {AppOptions} appOptions
     * @returns {void}
     */
    addResourceHandles(appOptions) {
        appOptions.resourceHandlers = [
            // @ts-ignore
            RenderHandler,
            // @ts-ignore
            AnimClipHandler,
            // @ts-ignore
            AnimStateGraphHandler,
            // @ts-ignore
            TextureHandler,
            // @ts-ignore
            CubemapHandler,
            // @ts-ignore
            BinaryHandler,
            // @ts-ignore
            ContainerHandler,
            // @ts-ignore
            GSplatHandler
        ];
    }
}

export { App };
