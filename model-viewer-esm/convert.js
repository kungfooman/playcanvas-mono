import transpile from 'ts-to-jsdoc';
import {readFileSync, writeFileSync} from 'fs';
function convert(i, o) {
    const contentTS = readFileSync(i, 'utf8');
    const contentJS = transpile(contentTS);
    writeFileSync(o, contentJS);
}
function copy(i, o) {
    const contentTS = readFileSync(i, 'utf8');
    writeFileSync(o, contentTS);
}

// these can be converted using ts-to-jsdoc
// convert('../model-viewer/src/app.ts'              , './src/app.js'              );
// convert('../model-viewer/src/debug-lines.ts'      , './src/debug-lines.js'      );
// convert('../model-viewer/src/drop-handler.ts'     , './src/drop-handler.js'     );
// convert('../model-viewer/src/helpers.ts'          , './src/helpers.js'          );
// convert('../model-viewer/src/index.tsx'           , './src/index.js'            );
// convert('../model-viewer/src/material.ts'         , './src/material.js'         );
// //convert('../model-viewer/src/multiframe.ts'       , './src/multiframe.js'       );
// convert('../model-viewer/src/orbit-camera.ts'     , './src/orbit-camera.js'     );
// convert('../model-viewer/src/projective-skybox.ts', './src/projective-skybox.js');
// convert('../model-viewer/src/read-depth.ts'       , './src/read-depth.js'       );
// convert('../model-viewer/src/shadow-catcher.ts'   , './src/shadow-catcher.js'   );
// convert('../model-viewer/src/types.ts'            , './src/types.js'            );
// convert('../model-viewer/src/viewer.ts'           , './src/viewer.js'           );
// convert('../model-viewer/src/xr-mode.ts'          , './src/xr-mode.js'          );

// tree -fi
/*
copy('../model-viewer/src/ui/selected-node.tsx'                 , './src/ui/selected-node.js'                 );
copy('../model-viewer/src/ui/components/index.tsx'              , './src/ui/components/index.js'              );
copy('../model-viewer/src/ui/errors.tsx'                        , './src/ui/errors.js'                        );
copy('../model-viewer/src/ui/index.tsx'                         , './src/ui/index.js'                         );
copy('../model-viewer/src/ui/left-panel/index.tsx'              , './src/ui/left-panel/index.js'              );
copy('../model-viewer/src/ui/left-panel/morph-target-panel.tsx' , './src/ui/left-panel/morph-target-panel.js' );
copy('../model-viewer/src/ui/load-controls.tsx'                 , './src/ui/load-controls.js'                 );
copy('../model-viewer/src/ui/popup-panel/animation-controls.tsx', './src/ui/popup-panel/animation-controls.js');
copy('../model-viewer/src/ui/popup-panel/index.tsx'             , './src/ui/popup-panel/index.js'             );
copy('../model-viewer/src/ui/popup-panel/panels.tsx'            , './src/ui/popup-panel/panels.js'            );
*/

// copy .tsx files over and then convert to .js:
/*
npx tsc ./src/ui/selected-node.tsx --jsx react --target esnext
npx tsc ./src/ui/components/index.tsx --jsx react --target esnext
npx tsc ./src/ui/errors.tsx --jsx react --target esnext
npx tsc ./src/ui/index.tsx --jsx react --target esnext
npx tsc ./src/ui/left-panel/index.tsx --jsx react --target esnext
npx tsc ./src/ui/left-panel/morph-target-panel.tsx --jsx react --target esnext
npx tsc ./src/ui/load-controls.tsx --jsx react --target esnext
npx tsc ./src/ui/popup-panel/animation-controls.tsx --jsx react --target esnext
npx tsc ./src/ui/popup-panel/index.tsx --jsx react --target esnext
npx tsc ./src/ui/popup-panel/panels.tsx --jsx react --target esnext
*/

