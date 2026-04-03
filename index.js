/**
 * Local development: node index.js
 */
import { app } from "./src/app.js";

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log(`Estate Luxe API listening on http://localhost:${port}`);
});
