"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_controller_1 = require("./index.controller");
const PORT = 3000;
index_controller_1.app.listen(PORT, () => {
    console.log('Server started');
});
