"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_init_1 = require("./blogs/db/db.init");
const index_controller_1 = require("./index.controller");
const PORT = 3000;
index_controller_1.app.listen(PORT, () => {
    (0, db_init_1.runDb)().catch(err => console.log(err));
    console.log('Server started');
});
