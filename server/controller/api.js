/**
 * GET /
 * Home page.
 */
exports.index = async function(req, res, next) {
  var loader = require("../core/dataLoader");
  var parser = require("../core/dataParser");
  var searcher = require("../core/searcher");

  var threshold = req.body.threshold === undefined ? 0.9 : req.body.threshold;
  var showTrans = req.body.showTrans;
  var vowel = req.body.vowel;
  var query = req.body.query;

  var dataMuqathaat = null;
  var dataQuran = null;
  var dataPosmap = null;
  var dataIndex = null;

  var allDataReady = false;
  var result = null;

  // var allDataReady = false;

  // console.log(req);

  await loader.loadResources(async function(buffer) {
    dataMuqathaat = await parser.parseMuqathaat(buffer["muqathaat"]);
    dataQuran = await parser.parseQuran(
      buffer["quran_teks"],
      buffer["quran_trans_indonesian"]
    );
    dataPosmap = {};
    dataPosmap["nv"] = await parser.parsePosmap(buffer["posmap_nv"]);
    dataPosmap["v"] = await parser.parsePosmap(buffer["posmap_v"]);

    dataIndex = {};
    dataIndex["nv"] = await parser.parseIndex(buffer["index_nv"]);
    dataIndex["v"] = await parser.parseIndex(buffer["index_v"]);

    allDataReady = true;
    console.log("MAIN: ALL READY");
    console.log("Parsing is Done");
    var mode = vowel == true ? "v" : "nv";

    if (allDataReady == true) {
      console.log(
        `SEARCH: threshold= ${threshold} mode = ${mode} translation = ${showTrans}`
      );
    }

    await searcher.search(
      dataIndex[mode],
      query,
      threshold,
      mode,
      async function(result) {
        await searcher.rank(result, dataPosmap[mode], dataQuran, async function(
          ranked
        ) {
          searcher.prepare(ranked, dataQuran, async function(final) {
            // await event.sender.send("searchDone", final);
            if (final.length == 0) {
              res.json({
                msg: "Ayat Tidak Ditemukan"
              });
            } else {
              res.json({
                final
              });
            }
          });
        });
      }
    );
  });

  console.log("Parsing is Done");
  var mode = vowel == true ? "v" : "nv";

  if (allDataReady == true) {
    console.log(
      `SEARCH: threshold= ${threshold} mode = ${mode} translation = ${showTrans}`
    );
  }

  // await searcher.search(dataIndex[mode], query, threshold, mode, async function(
  //   result
  // ) {
  //   console.log("Search");
  //   await searcher.rank(result, dataPosmap[mode], dataQuran, async function(
  //     ranked
  //   ) {
  //     searcher.prepare(ranked, dataQuran, async function(final) {
  //       await event.sender.send("searchDone", final);
  //       console.log(final);
  //       if (final.length == 0) {
  //         final = "Hasil tidak ditemukan";
  //       } else {
  //         result = final;
  //       }
  //     });
  //   });
  // });
};
