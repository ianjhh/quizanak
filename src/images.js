// Quiz and article images live in src/assets/images/<name>.jpg, and their
// names come from the database. A name without a matching file falls back to
// a default picture instead of crashing the page.
export function imageFor(name) {
    try {
        return require(`./assets/images/${name}.jpg`);
    } catch (err) {
        return require('./assets/images/binatang-laut1.jpg');
    }
}
