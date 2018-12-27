(function (doc) {

  let fs = require('fs');
  let SVGO = require('svgo');
  let svgo = new SVGO({
    plugins: [
      { cleanupAttrs: true                    },
      { removeDoctype: true                   },
      { removeXMLProcInst: true               },
      { removeComments: true                  },
      { removeMetadata: true                  },
      { removeTitle: true                     },
      { removeDesc: true                      },
      { removeUselessDefs: true               },
      { removeEditorsNSData: true             },
      { removeEmptyAttrs: true                },
      { removeHiddenElems: true               },
      { removeEmptyText: true                 },
      { removeEmptyContainers: true           },
      { removeViewBox: false                  },
      { cleanUpEnableBackground: true         },
      { convertStyleToAttrs: true             },
      { convertColors: true                   },
      { convertPathData: true                 },
      { convertTransform: true                },
      { removeUnknownsAndDefaults: true       },
      { removeNonInheritableGroupAttrs: true  },
      { removeUselessStrokeAndFill: true      },
      { removeUnusedNS: true                  },
      { cleanupIDs: true                      },
      { cleanupNumericValues: true            },
      { moveElemsAttrsToGroup: true           },
      { moveGroupAttrsToElems: true           },
      { collapseGroups: true                  },
      { removeRasterImages: false             },
      { mergePaths: true                      },
      { convertShapeToPath: true              },
      { sortAttrs: true                       },
      { transformsWithOnePath: false          },
      { removeDimensions: true                },
      { removeAttrs: {attrs: '(stroke|fill)'} }
    ]
  });
  let body = doc.body;
  let holder = doc.querySelector('.holder');
  let list = doc.querySelector('.list');
  let regSVGFile = /\.svg$/;

  // send files to the not already running app
  // ("Open With" or drag-n-drop)
  if (nw.App.argv.length) {
    let files = nw.App.argv.map(function (path) {
      return {
        name: path.substring(path.lastIndexOf('/') + 1),
        path: path
      };
    });

    onFilesDrop(files);
  }

  // send files to the already running app
  // ("Open With" or drag-n-drop)
  nw.App.on('open', function (path) {
    onFilesDrop([{
      name: path.substring(path.lastIndexOf('/') + 1),
      path: path
    }]);
  });

  body.ondragover = function () {
    return false;
  };

  body.ondragenter = function () {
    holder.classList.add('holder_state_hover');
    return false;
  };

  // drag-n-drop files to the app window's special holder
  body.ondrop = function (evt) {
    let files = [].slice.call(evt.dataTransfer.files);

    onFilesDrop(files);

    evt.preventDefault();
  };

  function onFilesDrop (files) {
    let docFragment = doc.createDocumentFragment();

    files.forEach(function (file) {
debugger;
      if (regSVGFile.test(file.name)) {

        let tr = doc.createElement('tr');
        let name = doc.createElement('td');
        let before = doc.createElement('td');
        let after = doc.createElement('td');
        let profit = doc.createElement('td');

        tr.className = 'item';
        name.className = 'item__cell item__cell_type_name';
        name.appendChild(doc.createTextNode(file.name));
        before.className = 'item__cell item__cell_type_before';
        after.className = 'item__cell item__cell_type_after';
        profit.className = 'item__cell item__cell_type_profit';

        tr.appendChild(name);
        tr.appendChild(before);
        tr.appendChild(after);
        tr.appendChild(profit);

        docFragment.appendChild(tr);

        (function (filepath, before, after, profit) {
          fs.readFile(filepath, 'utf8', function (err, data) {
            let inBytes = Buffer.byteLength(data, 'utf8');
            let outBytes;

            try {
              svgo
                .optimize(data, { path: filepath })
                .then(function (result) {
                  fs.writeFile(path, result.data, 'utf8', function (err) {
                    if (err) {
                      console.log(err);
                    }
                    outBytes = Buffer.byteLength(result.data, 'utf8');

                    before.appendChild(
                      doc.createTextNode(
                        Math.round((inBytes / 1024) * 1000) / 1000 + ' KiB'
                      )
                    );
                    after.appendChild(
                      doc.createTextNode(
                        Math.round((outBytes / 1024) * 1000) / 1000 + ' KiB'
                      )
                    );
                    profit.appendChild(
                      doc.createTextNode(
                        Math.round((100 - outBytes * 100 / inBytes) * 10) /  10 + '%'
                      )
                    );

                  });
              });
            } catch (err) {
              console.log(err);
              tr.classList.add('item_error_yes');
              tr.setAttribute('title', err.message);
              profit.appendChild(doc.createTextNode('error'));
            }
          });
        })(file.path, before, after, profit);
      }
    });

    if (docFragment.childNodes.length) {
      body.classList.add('page_layout_list');
      body.classList.remove('page_layout_holder');
      list.appendChild(docFragment);
    } else {
      holder.classList.remove('holder_state_hover');
    }
  }
})(document);
