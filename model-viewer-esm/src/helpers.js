const __PUBLIC_PATH__ = '../model-viewer/'

function getLogo() {
    return __PUBLIC_PATH__ + 'static/playcanvas-logo.png';
}

/**
 * @param {string} assetPath
 * @returns {string}
 */
function getAssetPath(assetPath) {
    // @ts-ignore: path variable injected at build time
    return (__PUBLIC_PATH__ ? __PUBLIC_PATH__ : '/static/') + assetPath;
}

/**
 * @returns {string}
 */
function getRootPath() {
    // @ts-ignore: path variable injected at build time
    return (__PUBLIC_PATH__ ? './model-viewer' : '.');
}

/**
 * @param {any} element
 * @param {any} callback
 * @param {number} [delta=2]
 * @returns {() => void}
 */
const addEventListenerOnClickOnly = (element, callback, delta = 2) => {
    let startX;
    let startY;

    const mouseDownEvt = (event) => {
        startX = event.pageX;
        startY = event.pageY;
    };
    element.addEventListener('mousedown', mouseDownEvt);

    const mouseUpEvt = (event) => {
        const diffX = Math.abs(event.pageX - startX);
        const diffY = Math.abs(event.pageY - startY);

        if (diffX < delta && diffY < delta) {
            callback(event);
        }
    };
    element.addEventListener('mouseup', mouseUpEvt);

    return () => {
        element.removeEventListener('mousedown', mouseDownEvt);
        element.removeEventListener('mouseup', mouseUpEvt);
    };
};

// extract members of the object given a list of paths to extract
/**
 * @param {any} obj
 * @param {string[]} paths
 * @returns {any}
 */
const extract = (obj, paths) => {

    const resolve = (obj, path) => {
        for (const p of path) {
            if (!obj.hasOwnProperty(p)) {
                return null;
            }
            obj = obj[p];
        }
        return obj;
    };

    const result = {};

    for (const pathString of paths) {
        const path = pathString.split('.');
        const value = resolve(obj, path);

        let parent = result;
        for (let i = 0; i < path.length; ++i) {
            const p = path[i];
            if (i < path.length - 1) {
                if (!parent.hasOwnProperty(p)) {
                    parent[p] = {};
                }
                parent = parent[p];
            }
            else {
                parent[p] = value;
            }
        }
    }

    return result;
};

export { getLogo, getAssetPath, getRootPath, addEventListenerOnClickOnly, extract };
