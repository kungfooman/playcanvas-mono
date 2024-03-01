import { basisInitialize, createGraphicsDevice, Vec3, WasmModule } from 'playcanvas';
import { Observer } from '@playcanvas/observer';

import { getAssetPath } from './helpers.js';
import { initMaterials } from './material.js';
import initializeUI from './ui/index.js';
import Viewer from './viewer.js';

import { version as pcuiVersion, revision as pcuiRevision } from 'pcui';
import { version as engineVersion, revision as engineRevision } from 'playcanvas';


async function getModelViewerVersion() {
    const resp = await fetch('../model-viewer/package.json');
    const json = await resp.json();
    return json.version;
}
const modelViewerVersion = await getModelViewerVersion();

const skyboxDir = '../model-viewer/static/skybox';

const skyboxes = [
    { label: "Abandoned Tank Farm", url: skyboxDir + "/abandoned_tank_farm_01_2k.hdr" },
    { label: "Adam's Place Bridge", url: skyboxDir + "/adams_place_bridge_2k.hdr" },
    { label: "Artist Workshop"    , url: skyboxDir + "/artist_workshop_2k.hdr" },
    { label: "Ballroom"           , url: skyboxDir + "/ballroom_2k.hdr" },
    { label: "Circus Arena"       , url: skyboxDir + "/circus_arena_2k.hdr" },
    { label: "Colorful Studio"    , url: skyboxDir + "/colorful_studio.hdr" },
    { label: "Golf Course Sunrise", url: skyboxDir + "/golf_course_sunrise_2k.hdr" },
    { label: "Helipad"            , url: skyboxDir + "/Helipad_equi.png" },
    { label: "Kloppenheim"        , url: skyboxDir + "/kloppenheim_02_2k.hdr" },
    { label: "Lebombo"            , url: skyboxDir + "/lebombo_2k.hdr" },
    { label: "Outdoor Umbrellas"  , url: skyboxDir + "/outdoor_umbrellas_2k.hdr" },
    { label: "Paul Lobe Haus"     , url: skyboxDir + "/paul_lobe_haus_2k.hdr" },
    { label: "Reinforced Concrete", url: skyboxDir + "/reinforced_concrete_01_2k.hdr" },
    { label: "Rural Asphalt Road" , url: skyboxDir + "/rural_asphalt_road_2k.hdr" },
    { label: "Spruit Sunrise"     , url: skyboxDir + "/spruit_sunrise_2k.hdr" },
    { label: "Studio Small"       , url: skyboxDir + "/studio_small_03_2k.hdr" },
    { label: "Venice Sunset"      , url: skyboxDir + "/venice_sunset_1k.hdr" },
    { label: "Vignaioli Night"    , url: skyboxDir + "/vignaioli_night_2k.hdr" },
    { label: "Wooden Motel"       , url: skyboxDir + "/wooden_motel_2k.hdr" }
];

const observerData = {
    ui: {
        active: null,
        spinner: false,
        error: null
    },
    camera: {
        fov: 40,
        tonemapping: 'Linear',
        pixelScale: 1,
        multisampleSupported: true,
        multisample: true,
        hq: true
    },
    skybox: {
        value: 'Paul Lobe Haus',
        options: JSON.stringify(['None'].concat(skyboxes.map(s => s.label)).map(l => { return { v: l, t: l }; })),
        exposure: 0,
        rotation: 0,
        background: 'Infinite Sphere',
        backgroundColor: { r: 0.4, g: 0.45, b: 0.5 },
        blur: 1,
        domeProjection: {
            domeRadius: 20,
            domeOffset: 0.4,
            tripodOffset: 0.1
        },
    },
    light: {
        enabled: false,
        color: { r: 1, g: 1, b: 1 },
        intensity: 1,
        follow: false,
        shadow: false
    },
    shadowCatcher: {
        enabled: false,
        intensity: 0.4,
    },
    debug: {
        renderMode: 'default',
        stats: false,
        wireframe: false,
        wireframeColor: { r: 0, g: 0, b: 0 },
        bounds: false,
        skeleton: false,
        axes: false,
        grid: true,
        normals: 0
    },
    animation: {
        playing: false,
        speed: 1.0,
        transition: 0.1,
        loops: 1,
        list: '[]',
        progress: 0,
        selectedTrack: 'ALL_TRACKS'
    },
    scene: {
        urls: [],
        filenames: [],
        nodes: '[]',
        selectedNode: {
            path: '',
            name: null,
            position: {
                0: 0,
                1: 0,
                2: 0
            },
            rotation: {
                0: 0,
                1: 0,
                2: 0,
                3: 0
            },
            scale: {
                0: 0,
                1: 0,
                2: 0
            }
        },
        meshCount: null,
        materialCount: null,
        textureCount: null,
        vertexCount: null,
        primitiveCount: null,
        textureVRAM: null,
        meshVRAM: null,
        bounds: null,
        variant: {
            selected: 0
        },
        variants: {
            list: '[]'
        },
        loadTime: null
    },
    runtime: {
        activeDeviceType: '',
        viewportWidth: 0,
        viewportHeight: 0,
        xrSupported: false,
        xrActive: false
    },
    morphs: null,
    enableWebGPU: false,
    centerScene: false
};

/**
 * @param {Observer} observer
 * @param {string} name
 * @returns {void}
 */
const saveOptions = (observer, name) => {
    const options = observer.json();
    window.localStorage.setItem(`model-viewer-${name}`, JSON.stringify({
        camera: options.camera,
        skybox: options.skybox,
        light: options.light,
        debug: options.debug,
        shadowCatcher: options.shadowCatcher,
        enableWebGPU: options.enableWebGPU
    }));
};

/**
 * @param {Observer} observer
 * @param {string} name
 * @param {Map<string, string>} skyboxUrls
 * @returns {void}
 */
const loadOptions = (observer, name, skyboxUrls) => {
    const filter = ['skybox.options', 'debug.renderMode'];

    const loadRec = (path, value) => {
        if (filter.indexOf(path) !== -1) {
            return;
        }

        if (typeof value === 'object') {
            Object.keys(value).forEach((k) => {
                loadRec(path ? `${path}.${k}` : k, value[k]);
            });
        }
        else {
            if (path !== 'skybox.value' || value === 'None' || skyboxUrls.has(value)) {
                observer.set(path, value);
            }
        }
    };

    const options = window.localStorage.getItem(`model-viewer-${name}`);
    if (options) {
        try {
            loadRec('', JSON.parse(options));
        }
        catch { }
    }
};


// print out versions of dependent packages
console.log(`Model Viewer v${modelViewerVersion} | PCUI v${pcuiVersion} (${pcuiRevision}) | PlayCanvas Engine v${engineVersion} (${engineRevision})`);

/**
 * @returns {void}
 */
const main = () => {
    // initialize the apps state
    const observer = new Observer(observerData);

    // global url
    const url = new URL(window.location.href);

    initMaterials();

    basisInitialize({
        glueUrl: getAssetPath('lib/basis/basis.wasm.js'),
        wasmUrl: getAssetPath('lib/basis/basis.wasm.wasm'),
        fallbackUrl: getAssetPath('lib/basis/basis.js'),
        lazyInit: true
    });

    // @ts-ignore
    WasmModule.setConfig('DracoDecoderModule', {
        glueUrl: getAssetPath('lib/draco/draco.wasm.js'),
        wasmUrl: getAssetPath('lib/draco/draco.wasm.wasm'),
        fallbackUrl: getAssetPath('lib/draco/draco.js')
    });

    const skyboxUrls = new Map(skyboxes.map(s => [s.label, getAssetPath(s.url)]));

    // hide / show spinner when loading files
    observer.on('ui.spinner:set', (value) => {
        const spinner = document.getElementById('spinner');
        if (value) {
            spinner.classList.remove('pcui-hidden');
        }
        else {
            spinner.classList.add('pcui-hidden');
        }
    });

    if (!url.searchParams.has('default')) {
        // handle options
        loadOptions(observer, 'uistate', skyboxUrls);

        observer.on('*:set', () => {
            saveOptions(observer, 'uistate');
        });
    }

    // create react ui
    initializeUI(observer);

    // create the canvas
    const canvas = document.getElementById("application-canvas");

    // create the graphics device
    createGraphicsDevice(canvas, {
        deviceTypes: url.searchParams.has('webgpu') || observer.get('enableWebGPU') ? ['webgpu'] : [],
        glslangUrl: getAssetPath('lib/glslang/glslang.js'),
        twgslUrl: getAssetPath('lib/twgsl/twgsl.js'),
        antialias: false,
        depth: false,
        stencil: false,
        xrCompatible: true,
        powerPreference: 'high-performance'
    }).then((device) => {
        observer.set('runtime.activeDeviceType', device.deviceType);

        // create viewer instance
        const viewer = new Viewer(canvas, device, observer, skyboxUrls);

        // make available globally
        window.viewer = viewer;

        // get list of files, decode them
        const files = [];

        // handle search params
        for (const [key, value] of url.searchParams) {
            switch (key) {
                case 'load':
                case 'assetUrl':
                    {
                        const url = decodeURIComponent(value);
                        files.push({ url, filename: url });
                        break;
                    }
                    ;
                case 'cameraPosition': {
                    const pos = value.split(',').map(Number);
                    if (pos.length === 3) {
                        viewer.initialCameraPosition = new Vec3(pos);
                    }
                    break;
                }
                case 'cameraFocus': {
                    const pos = value.split(',').map(Number);
                    if (pos.length === 3) {
                        viewer.initialCameraFocus = new Vec3(pos);
                    }
                    break;
                }
                default: {
                    if (observer.has(key)) {
                        switch (typeof observer.get(key)) {
                            case 'boolean':
                                observer.set(key, value.toLowerCase() === 'true');
                                break;
                            case 'number':
                                observer.set(key, Number(value));
                                break;
                            default:
                                observer.set(key, decodeURIComponent(value));
                                break;
                        }
                    }
                    break;
                }
            }
        }

        if (files.length > 0) {
            viewer.loadFiles(files);
        }
    });
};

// start main
main();
