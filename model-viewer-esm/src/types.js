export {};

/** @typedef {(path: string, value: any) => void} SetProperty */

/**
 * @typedef {Object} MorphTargetData
 * @property {string} name
 * @property {number} targetIndex
 * @property {number} [weight] 
 */
/**
 * @typedef {Object} File
 * @property {string} url
 * @property {string} [filename] 
 */
/**
 * @typedef {Object} Option
 * @property {string | number | null} v
 * @property {string} t 
 */
/**
 * @typedef {Object} HierarchyNode
 * @property {string} name
 * @property {string} path
 * @property {Array<HierarchyNode>} children 
 */
/**
 * @typedef {Object} ObserverData
 * @property {Object} ui
 * @property {string} [ui.active]
 * @property {boolean} ui.spinner
 * @property {string} [ui.error]
 * @property {Object} camera
 * @property {number} camera.fov
 * @property {string} camera.tonemapping
 * @property {number} camera.pixelScale
 * @property {boolean} camera.multisampleSupported
 * @property {boolean} camera.multisample
 * @property {boolean} camera.hq
 * @property {Object} skybox
 * @property {string} skybox.value
 * @property {string} skybox.options
 * @property {number} skybox.exposure
 * @property {number} skybox.rotation
 * @property {'Solid Color' | 'Infinite Sphere' | 'Projective Dome'} skybox.background
 * @property {Object} skybox.backgroundColor
 * @property {number} skybox.backgroundColor.r
 * @property {number} skybox.backgroundColor.g
 * @property {number} skybox.backgroundColor.b
 * @property {number} skybox.blur
 * @property {Object} skybox.domeProjection
 * @property {number} skybox.domeProjection.domeRadius
 * @property {number} skybox.domeProjection.domeOffset
 * @property {number} skybox.domeProjection.tripodOffset
 * @property {Object} light
 * @property {boolean} light.enabled
 * @property {Object} light.color
 * @property {number} light.color.r
 * @property {number} light.color.g
 * @property {number} light.color.b
 * @property {number} light.intensity
 * @property {boolean} light.follow
 * @property {boolean} light.shadow
 * @property {Object} shadowCatcher
 * @property {boolean} shadowCatcher.enabled
 * @property {number} shadowCatcher.intensity
 * @property {Object} debug
 * @property {'default' | 'albedo' | 'opacity' | 'worldNormal' | 'specularity' | 'gloss' | 'metalness' | 'ao' | 'emission' | 'lighting' | 'uv0'} debug.renderMode
 * @property {boolean} debug.stats
 * @property {boolean} debug.wireframe
 * @property {Object} debug.wireframeColor
 * @property {number} debug.wireframeColor.r
 * @property {number} debug.wireframeColor.g
 * @property {number} debug.wireframeColor.b
 * @property {boolean} debug.bounds
 * @property {boolean} debug.skeleton
 * @property {boolean} debug.axes
 * @property {boolean} debug.grid
 * @property {number} debug.normals
 * @property {Object} animation
 * @property {boolean} animation.playing
 * @property {number} animation.speed
 * @property {number} animation.transition
 * @property {number} animation.loops
 * @property {string} animation.list
 * @property {number} animation.progress
 * @property {string} animation.selectedTrack
 * @property {Object} scene
 * @property {string[]} scene.urls
 * @property {string[]} scene.filenames
 * @property {string} scene.nodes
 * @property {Object} scene.selectedNode
 * @property {string} scene.selectedNode.path
 * @property {string} [scene.selectedNode.name]
 * @property {Object} scene.selectedNode.position
 * @property {number} scene.selectedNode.position.0
 * @property {number} scene.selectedNode.position.1
 * @property {number} scene.selectedNode.position.2
 * @property {Object} scene.selectedNode.rotation
 * @property {number} scene.selectedNode.rotation.0
 * @property {number} scene.selectedNode.rotation.1
 * @property {number} scene.selectedNode.rotation.2
 * @property {number} scene.selectedNode.rotation.3
 * @property {Object} scene.selectedNode.scale
 * @property {number} scene.selectedNode.scale.0
 * @property {number} scene.selectedNode.scale.1
 * @property {number} scene.selectedNode.scale.2
 * @property {number} [scene.meshCount]
 * @property {number} [scene.materialCount]
 * @property {number} [scene.textureCount]
 * @property {number} [scene.vertexCount]
 * @property {number} [scene.primitiveCount]
 * @property {number} [scene.textureVRAM]
 * @property {number} [scene.meshVRAM]
 * @property {any} [scene.bounds]
 * @property {Object} scene.variant
 * @property {number} scene.variant.selected
 * @property {Object} scene.variants
 * @property {string} scene.variants.list
 * @property {number} [scene.loadTime]
 * @property {Record<string, {        name: string,        targets: Record<string, MorphTargetData>    }>} [morphs]
 * @property {Object} runtime
 * @property {string} runtime.activeDeviceType
 * @property {number} runtime.viewportWidth
 * @property {number} runtime.viewportHeight
 * @property {boolean} runtime.xrSupported
 * @property {boolean} runtime.xrActive
 * @property {boolean} enableWebGPU
 * @property {boolean} centerScene 
 */
