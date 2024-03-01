import { BLEND_NORMAL, BUFFER_DYNAMIC, FUNC_GREATER, PRIMITIVE_LINES, SEMANTIC_BLENDINDICES, SEMANTIC_BLENDWEIGHT, SEMANTIC_NORMAL, SEMANTIC_POSITION, SEMANTIC_COLOR, SORTMODE_NONE, TYPE_FLOAT32, TYPE_UINT8, createShaderFromCode, DepthState, GraphNode, Layer, Material, Mesh, MeshInstance, Mat4, Vec3, VertexBuffer, VertexFormat, VertexIterator } from 'playcanvas';

let debugLayerFront = null;
let debugLayerBack = null;

const v0 = new Vec3();
const v1 = new Vec3();
const v2 = new Vec3();
const up = new Vec3(0, 1, 0);
const mat = new Mat4();
const unitBone = [
    [[0, 0, 0], [-0.5, 0, 0.3]],
    [[0, 0, 0], [0.5, 0, 0.3]],
    [[0, 0, 0], [0, -0.5, 0.3]],
    [[0, 0, 0], [0, 0.5, 0.3]],
    [[0, 0, 1], [-0.5, 0, 0.3]],
    [[0, 0, 1], [0.5, 0, 0.3]],
    [[0, 0, 1], [0, -0.5, 0.3]],
    [[0, 0, 1], [0, 0.5, 0.3]],
    [[0, -0.5, 0.3], [0.5, 0, 0.3]],
    [[0.5, 0, 0.3], [0, 0.5, 0.3]],
    [[0, 0.5, 0.3], [-0.5, 0, 0.3]],
    [[-0.5, 0, 0.3], [0, -0.5, 0.3]]
];

const vshader = `
attribute vec3 vertex_position;
attribute vec4 vertex_color;

varying vec2 zw;
varying vec4 vColor;

uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;

void main(void) {
    vColor = vertex_color;

    gl_Position = matrix_viewProjection * matrix_model * vec4(vertex_position, 1.0);

    // store z/w for later use in fragment shader
    zw = gl_Position.zw;

    // disable depth clipping
    gl_Position.z = 0.0;
}`;

const fshader = `
precision highp float;

varying vec2 zw;
varying vec4 vColor;
uniform vec4 uColor;

void main(void) {
    gl_FragColor = vColor * uColor;

    // clamp depth in Z to [0, 1] range
    gl_FragDepth = max(0.0, min(1.0, (zw.x / zw.y + 1.0) * 0.5));
}`;

class DebugLines {
    app = undefined;
    mesh = undefined;
    meshInstances = undefined;
    vertexFormat = undefined;
    vertexCursor = undefined;
    vertexData = undefined;
    colorData = undefined;
    /** @default new DepthState() */
    depthState = new DepthState();

    constructor(app, camera, backLayer = true) {
        const device = app.graphicsDevice;

        const shader = createShaderFromCode(device, vshader, fshader, 'debug-lines', {
            vertex_position: SEMANTIC_POSITION,
            vertex_color: SEMANTIC_COLOR
        });

        if (!debugLayerFront) {
            // construct the debug layer
            debugLayerBack = new Layer({
                enabled: true,
                name: 'Debug Layer Behind',
                opaqueSortMode: SORTMODE_NONE,
                transparentSortMode: SORTMODE_NONE,
                passThrough: true,
                overrideClear: true
            });

            debugLayerFront = new Layer({
                enabled: true,
                name: 'Debug Layer',
                opaqueSortMode: SORTMODE_NONE,
                transparentSortMode: SORTMODE_NONE,
                passThrough: true,
                overrideClear: true
            });

            app.scene.layers.pushTransparent(debugLayerBack);
            app.scene.layers.pushTransparent(debugLayerFront);
            camera.camera.layers = camera.camera.layers.concat([debugLayerBack.id, debugLayerFront.id]);
        }

        const vertexFormat = new VertexFormat(device, [
            { semantic: SEMANTIC_POSITION, components: 3, type: TYPE_FLOAT32 },
            { semantic: SEMANTIC_COLOR, components: 4, type: TYPE_UINT8, normalize: true }
        ]);

        // construct the mesh
        const mesh = new Mesh(device);
        mesh.vertexBuffer = new VertexBuffer(device, vertexFormat, 8192, BUFFER_DYNAMIC);
        mesh.primitive[0].type = PRIMITIVE_LINES;
        mesh.primitive[0].base = 0;
        mesh.primitive[0].indexed = false;
        mesh.primitive[0].count = 0;

        const frontMaterial = new Material();
        frontMaterial.shader = shader;
        frontMaterial.setParameter('uColor', [1, 1, 1, 0.7]);
        frontMaterial.blendType = BLEND_NORMAL;
        frontMaterial.update();

        const frontInstance = new MeshInstance(mesh, frontMaterial, new GraphNode());
        frontInstance.cull = false;
        frontInstance.visible = false;

        debugLayerFront.addMeshInstances([frontInstance], true);

        this.meshInstances = [frontInstance];

        // construct back
        if (backLayer) {
            const backMaterial = new Material();
            backMaterial.shader = shader;
            backMaterial.setParameter('uColor', [0.5, 0.5, 0.5, 0.5]);
            backMaterial.blendType = BLEND_NORMAL;
            backMaterial.depthState.func = FUNC_GREATER;
            backMaterial.depthState.write = false;
            backMaterial.update();

            const backInstance = new MeshInstance(mesh, backMaterial, new GraphNode());
            backInstance.cull = false;
            backInstance.visible = false;

            debugLayerBack.addMeshInstances([backInstance], true);

            this.meshInstances.push(backInstance);
        }

        this.app = app;
        this.mesh = mesh;

        this.vertexFormat = vertexFormat;
        this.vertexCursor = 0;
        this.vertexData = new Float32Array(this.mesh.vertexBuffer.lock());
        this.colorData = new Uint32Array(this.mesh.vertexBuffer.lock());
    }

    /**
     * @private
     * @static
     * @param {Mat4} result
     * @param {Mat4} mat
     * @param {number} factor
     * @returns {void}
     */
    static matrixMad(result, mat, factor) {
        if (factor > 0) {
            for (let i = 0; i < 16; ++i) {
                result.data[i] += mat.data[i] * factor;
            }
        }
    }

    /**
     * @returns {void}
     */
    clear() {
        this.vertexCursor = 0;
    }

    /**
     * @param {Vec3} min
     * @param {Vec3} max
     * @returns {void}
     */
    box(min, max) {
        this.line(new Vec3(min.x, min.y, min.z), new Vec3(max.x, min.y, min.z));
        this.line(new Vec3(max.x, min.y, min.z), new Vec3(max.x, min.y, max.z));
        this.line(new Vec3(max.x, min.y, max.z), new Vec3(min.x, min.y, max.z));
        this.line(new Vec3(min.x, min.y, max.z), new Vec3(min.x, min.y, min.z));

        this.line(new Vec3(min.x, max.y, min.z), new Vec3(max.x, max.y, min.z));
        this.line(new Vec3(max.x, max.y, min.z), new Vec3(max.x, max.y, max.z));
        this.line(new Vec3(max.x, max.y, max.z), new Vec3(min.x, max.y, max.z));
        this.line(new Vec3(min.x, max.y, max.z), new Vec3(min.x, max.y, min.z));

        this.line(new Vec3(min.x, min.y, min.z), new Vec3(min.x, max.y, min.z));
        this.line(new Vec3(max.x, min.y, min.z), new Vec3(max.x, max.y, min.z));
        this.line(new Vec3(max.x, min.y, max.z), new Vec3(max.x, max.y, max.z));
        this.line(new Vec3(min.x, min.y, max.z), new Vec3(min.x, max.y, max.z));
    }

    /**
     * @param {Vec3} v0
     * @param {Vec3} v1
     * @param {number} [clr=0xffffffff]
     * @returns {void}
     */
    line(v0, v1, clr = 0xffffffff) {
        if (this.vertexCursor >= this.vertexData.length / 8) {
            const oldVBuffer = this.mesh.vertexBuffer;
            const byteSize = oldVBuffer.lock().byteLength * 2;
            const arrayBuffer = new ArrayBuffer(byteSize);

            this.mesh.vertexBuffer = new VertexBuffer(this.app.graphicsDevice, oldVBuffer.getFormat(), oldVBuffer.getNumVertices() * 2, BUFFER_DYNAMIC, arrayBuffer);
            this.vertexData = new Float32Array(arrayBuffer);
            this.colorData = new Uint32Array(arrayBuffer);

            this.colorData.set(new Uint32Array(oldVBuffer.lock()));
        }

        const vertex = this.vertexCursor;
        const vertexData = this.vertexData;
        const colorData = this.colorData;
        vertexData[vertex * 8 + 0] = v0.x;
        vertexData[vertex * 8 + 1] = v0.y;
        vertexData[vertex * 8 + 2] = v0.z;
        colorData[vertex * 8 + 3] = clr;
        vertexData[vertex * 8 + 4] = v1.x;
        vertexData[vertex * 8 + 5] = v1.y;
        vertexData[vertex * 8 + 6] = v1.z;
        colorData[vertex * 8 + 7] = clr;
        this.vertexCursor++;
    }

    /**
     * @param {VertexBuffer} vertexBuffer
     * @param {Mat4} worldMat
     * @param {number} length
     * @param {Array<Mat4>} skinMatrices
     * @returns {void}
     */
    generateNormals(vertexBuffer, worldMat, length, skinMatrices) {
        const it = new VertexIterator(vertexBuffer);
        const positions = it.element[SEMANTIC_POSITION];
        const normals = it.element[SEMANTIC_NORMAL];
        const blendIndices = it.element[SEMANTIC_BLENDINDICES];
        const blendWeights = it.element[SEMANTIC_BLENDWEIGHT];

        const numVertices = vertexBuffer.getNumVertices();
        const p0 = new Vec3();
        const p1 = new Vec3();
        const skinMat = new Mat4();

        for (let i = 0; i < numVertices; ++i) {
            // get local/morphed positions and normals
            p0.set(positions.get(0), positions.get(1), positions.get(2));
            p1.set(normals.get(0), normals.get(1), normals.get(2));

            if (blendIndices && blendWeights && skinMatrices) {
                // transform by skinning matrices
                skinMat.copy(Mat4.ZERO);
                for (let j = 0; j < 4; ++j) {
                    DebugLines.matrixMad(skinMat, skinMatrices[blendIndices.get(j)], blendWeights.get(j));
                }
                skinMat.mul2(worldMat, skinMat);
                skinMat.transformPoint(p0, p0);
                skinMat.transformVector(p1, p1);
            }
            else {
                worldMat.transformPoint(p0, p0);
                worldMat.transformVector(p1, p1);
            }

            p1.normalize().mulScalar(length).add(p0);

            this.line(p0, p1);

            it.next();
        }
    }

    // render a bone originating at p0 and ending at p1
    /**
     * @param {Vec3} p0
     * @param {Vec3} p1
     * @param {number} [clr=0xffffffff]
     * @returns {void}
     */
    bone(p0, p1, clr = 0xffffffff) {
        mat.setLookAt(p0, p1, up);

        v0.sub2(p1, p0);
        const len = v0.length();
        const transform = (v, va) => {
            v0.set(va[0] * len * 0.3, va[1] * len * 0.3, va[2] * -len);
            mat.transformPoint(v0, v);
        };

        unitBone.forEach((line) => {
            transform(v1, line[0]);
            transform(v2, line[1]);
            this.line(v1, v2, clr);
        });
    }

    // render a colored axis at the given matrix orientation and size
    /**
     * @param {Mat4} m
     * @param {number} [size=1]
     * @returns {void}
     */
    axis(m, size = 1) {
        m.getTranslation(v0);
        m.getScale(v2);

        // ignore matrix scale
        v2.set(size / v2.x, size / v2.y, size / v2.z);

        m.getX(v1).mul(v2).add(v0);
        this.line(v0, v1, 0xff0000ff);

        m.getY(v1).mul(v2).add(v0);
        this.line(v0, v1, 0xff00ff00);

        m.getZ(v1).mul(v2).add(v0);
        this.line(v0, v1, 0xffff0000);
    }

    // generate skeleton
    /**
     * @param {GraphNode} node
     * @param {boolean} showBones
     * @param {boolean} showAxes
     * @param {GraphNode} selectedNode
     * @returns {void}
     */
    generateSkeleton(node, showBones, showAxes, selectedNode) {
        const recurse = (curr, selected) => {
            if (curr.enabled) {
                selected ||= (curr === selectedNode);

                // render child links
                for (let i = 0; i < curr.children.length; ++i) {
                    const child = curr.children[i];
                    if (showBones) {
                        this.bone(curr.getPosition(), child.getPosition(), selected ? 0xffffff00 : 0xffffffff);
                    }
                    recurse(child, selected);
                }

                // render axis
                if (showAxes) {
                    const parent = node.parent;
                    if (parent) {
                        v0.sub2(curr.getPosition(), parent.getPosition());
                        this.axis(curr.getWorldTransform(), v0.length() * 0.05);
                    }
                }
            }
        };
        recurse(node, false);
    }

    /**
     * @returns {void}
     */
    update() {
        const empty = this.vertexCursor === 0;
        if (!empty) {
            this.meshInstances.forEach((m) => {
                m.visible = true;
            });
            this.mesh.vertexBuffer.unlock();
            this.mesh.primitive[0].count = this.vertexCursor * 2;
            this.vertexCursor = 0;
        }
        else {
            this.meshInstances.forEach((m) => {
                m.visible = false;
            });
        }
    }
}

export { DebugLines };
