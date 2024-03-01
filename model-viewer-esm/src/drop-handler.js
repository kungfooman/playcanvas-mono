import { path } from 'playcanvas';

/**
 * @param {Array<FileSystemEntry>} entries
 * @returns {Promise<Array<FileSystemFileEntry>>}
 */
const resolveDirectories = (entries) => {
    const promises = [];
    const result = [];

    entries.forEach((entry) => {
        if (entry.isFile) {
            result.push(entry);
        }
        else if (entry.isDirectory) {
            promises.push(new Promise((resolve) => {
                const reader = entry.createReader();

                const p = [];

                const read = () => {
                    reader.readEntries((children) => {
                        if (children.length > 0) {
                            p.push(resolveDirectories(children));
                            read();
                        }
                        else {
                            Promise.all(p)
                                .then((children) => {
                                resolve(children.flat());
                            });
                        }
                    });
                };
                read();
            }));
        }
    });

    return Promise.all(promises)
        .then((children) => {
        return result.concat(...children);
    });
};

/**
 * @param {Array<File>} urls
 * @returns {void}
 */
const removeCommonPrefix = (urls) => {
    const split = (pathname) => {
        const parts = pathname.split(path.delimiter);
        const base = parts[0];
        const rest = parts.slice(1).join(path.delimiter);
        return [base, rest];
    };
    while (true) {
        const parts = split(urls[0].filename);
        if (parts[1].length === 0) {
            return;
        }
        for (let i = 1; i < urls.length; ++i) {
            const other = split(urls[i].filename);
            if (parts[0] !== other[0]) {
                return;
            }
        }
        for (let i = 0; i < urls.length; ++i) {
            urls[i].filename = split(urls[i].filename)[1];
        }
    }
};

// configure drag and drop
/**
 * @param {HTMLElement} target
 * @param {DropHandlerFunc} dropHandler
 * @returns {void}
 */
const CreateDropHandler = (target, dropHandler) => {
    target.addEventListener('dragstart', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.dataTransfer.effectAllowed = "all";
    }, false);

    target.addEventListener('dragover', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.dataTransfer.effectAllowed = "all";
    }, false);

    target.addEventListener('drop', (ev) => {
        ev.preventDefault();

        const entries = Array.from(ev.dataTransfer.items)
            .map(item => item.webkitGetAsEntry());

        resolveDirectories(entries)
            .then((entries) => {
            return Promise.all(entries.map((entry) => {
                return new Promise((resolve) => {
                    entry.file((entryFile) => {
                        resolve({
                            url: URL.createObjectURL(entryFile),
                            filename: entry.fullPath.substring(1)
                        });
                    });
                });
            }));
        })
            .then((files) => {
            if (files.length > 1) {
                removeCommonPrefix(files);
            }
            dropHandler(files, !ev.shiftKey);
        });
    }, false);
};

export { CreateDropHandler };

/** @typedef {(files: Array<File>, resetScene: boolean) => void} DropHandlerFunc */

/**
 * @typedef {Object} File
 * @property {string} url
 * @property {string} [filename] 
 */
