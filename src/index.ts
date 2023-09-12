import { runDb } from "./blogs/db/db.init";
import { app } from "./index.controller"

const PORT = 3000 

app.listen(PORT, () =>{
    runDb().catch(err => console.log(err));

    console.log('Server started')
})