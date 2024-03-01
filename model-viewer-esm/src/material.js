import { BLEND_NONE, BLENDEQUATION_ADD, BLENDMODE_ONE, BLENDMODE_ONE_MINUS_SRC_ALPHA, Material } from 'playcanvas';

let setBlendTypeOrig;

/**
 * @param {number} type
 * @returns {void}
 */
function setBlendType(type) {
    // set engine function
    setBlendTypeOrig.call(this, type);

    // tweak alpha blending
    switch (type) {
        case BLEND_NONE:
            break;
        default:
            this._blendState.setAlphaBlend(BLENDEQUATION_ADD, BLENDMODE_ONE, BLENDMODE_ONE_MINUS_SRC_ALPHA);
            break;
    }
}

// here we patch the material set blendType function to blend
// alpha correctly

/**
 * @returns {void}
 */
const initMaterials = () => {
    const blendTypeDescriptor = Object.getOwnPropertyDescriptor(Material.prototype, 'blendType');

    // store the original setter
    setBlendTypeOrig = blendTypeDescriptor.set;

    // update the setter function
    Object.defineProperty(Material.prototype, 'blendType', {
        set(type) {
            setBlendType.call(this, type);
        },
        get() {
            return blendTypeDescriptor.get.call(this);
        }
    });
};

export { initMaterials };
