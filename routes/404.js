const getPageNotFound = require("../controllers/404");

const router = express.Router();

router.use("/", getPageNotFound.getPageNotFound);

module;
