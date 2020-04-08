var tree = null;
var isTransitions = true;
var treeData = "";
var stepArrData = [];
var stepIndex = 0;

function init_tree(tree_data, isUpdate) {
  treeData = trim(tree_data);
  if (!isUpdate) {
    stepArrData.push(treeData);
    stepIndex = stepArrData.length - 1;
  };

  // 配置项
  var config = {
    leftOffset: 120,
    legend: {
      x: 10,
      y: 20,
      space: 12,
      font: {
        size: 12,
        color: "rgb(51, 51, 51)",
        family: '"Helvetica Neue", Helvetica, sans-serif',
        x: 0,
        y: 0
      },
      shape: {
        type: 'circle', // rect circle
        r: 7,
        width: 15,
        height: 15,
        stroke: "#666",
        style: "stroke-width: 0.5;"
      },
    },
    genus_legend: {
      show: false,
      distance: 30, //label间距
      x: 0,
      y: 10,
      space: 5,
      padding: 10
    },
    flag_legend: {
      x: 0,
      y: 0,
      space: 5,
      padding: 10,
      color: "#aaa"
    },
    node: {
      size: 5,
      font: {
        // size: "",
        // color: "",
        family: '"Helvetica Neue", Helvetica, sans-serif',
        x: -30,
        y: 12
      }
    }
  };

  var dom_svg = document.querySelector('#chart_svg');

  // 添加 node 节点图例
  var chart_l = d3.select('#chart_l');
  var cl = labelConfig.identity_genus.length;
  var scale = (cl[1] - cl[0]) / 5;
  var legendArr = [
    { index: 'leg1', name: '(' + (cl[0] + scale * 4).toFixed(2) + '~' + (cl[0] + scale * 5).toFixed(2) + ']', color: "#AE271C", start: (cl[0] + scale * 4).toFixed(2), end: (cl[0] + scale * 5).toFixed(2) },
    { index: 'leg2', name: '(' + (cl[0] + scale * 3).toFixed(2) + '~' + (cl[0] + scale * 4).toFixed(2) + ']', color: "#F93529", start: (cl[0] + scale * 3).toFixed(2), end: cl[0] + scale * 4 },
    { index: 'leg3', name: '(' + (cl[0] + scale * 2).toFixed(2) + '~' + (cl[0] + scale * 3).toFixed(2) + ']', color: "#F96D29", start: (cl[0] + scale * 2).toFixed(2), end: (cl[0] + scale * 3).toFixed(1) },
    { index: 'leg4', name: '(' + (cl[0] + scale * 1).toFixed(2) + '~' + (cl[0] + scale * 2).toFixed(2) + ']', color: "#FFA503", start: (cl[0] + scale * 1).toFixed(2), end: cl[0] + scale * 2 },
    { index: 'leg5', name: '[' + (cl[0]).toFixed(2) + '~' + (cl[0] + scale * 1).toFixed(2) + ']', color: "#FFE700", start: (cl[0] + scale * 1).toFixed(2), end: (scale * 1).toFixed(2) },
  ];

  var isClickArr = [], each = null;
  chart_l.attr("transform", 'translate(' + config.legend.x + ',' + config.legend.y + ')')
  var legend = chart_l.selectAll(".legend").data(legendArr).enter().append("g").attr("class", "legend")
    .attr("index", function (item, i) {
      return item.index;
    }).attr("cursor", "pointer")
    .attr("transform", function (item, i) {
      return 'translate(0,' + (config.legend.space + config.legend.shape.height) * i + ')'
    })
    .on("mouseover", function (d, i) {
      d3.select(this).select(config.legend.shape.type).transition().duration(200).attr("transform", "translate(-1,-1)scale(1.2)")
      d3.selectAll('.' + d3.select(this).attr("index")).transition().duration(200).attr("r", 7);
    })
    .on("mouseout", function (d, i) {
      var _this = this;
      each = d3.select(this).attr("index");
      d3.select(this).select(config.legend.shape.type).transition().duration(200).attr("transform", "")
      d3.selectAll('.' + each).transition().duration(200).attr("r", config.node.size);
      isClickArr.forEach(function (item, i) {
        if (each === item) {
          d3.select(_this).select(config.legend.shape.type).transition().duration(200).attr("transform", "translate(-1,-1)scale(1.2)")
          d3.selectAll('.' + item).transition().duration(200).attr("r", 7);
        }
      });
    })
    .on("click", function (d, i) {
      var is = false;
      each = d3.select(this).attr("index");
      isClickArr.forEach(function (item, i) {
        if (each === item) {
          isClickArr.splice(i, 1);
          is = true;
        }
      });
      if (!is) {
        isClickArr.push(each)
      };
      d3.select(this).select(config.legend.shape.type).transition().duration(200).attr("transform", "translate(-1,-1)scale(1.2)")
      d3.selectAll('.' + d3.select(this).attr("index")).transition().duration(200).attr("r", 7);
    });

  legend.append(config.legend.shape.type).attr("r", config.legend.shape.r).attr("width", config.legend.shape.width).attr("height", config.legend.shape.height)
    .attr("fill", function (item) {
      return item.color
    }).attr("stroke", config.legend.shape.stroke).attr("style", config.legend.shape.style)

  legend.append("text").attr("x", config.legend.font.x + 23).attr("y", config.legend.font.y + 10)
    .attr("style", 'font-size: ' + config.legend.font.size + 'px; fill: ' + config.legend.font.color + '; font-family: ' + config.legend.font.family + ';').text(function (obj) {
      return obj.name
    }).attr("transform", function (d) {
      return "translate(-5,-" + (config.legend.shape.r - 1) + ")"
    })


  // 初始化树图
  var svg_width = dom_svg.getBoundingClientRect().width
  var svg_height = dom_svg.getBoundingClientRect().height
  var chart_g = d3.select("#chart_g");
  tree = d3.layout.phylotree()
    .options({
      'left-offset': config.leftOffset,
      'show-scale': true,
      'left-right-spacing': 'fit-to-size',
      'top-bottom-spacing': 'fit-to-size',
      // zoom: true,
      transitions: isTransitions,
      language: 'chinese', //chinese english
      legend: legendArr,
      itemStyle: config,
    })
    .radial(false)
    .svg(chart_g)
    .align_tips(true)
    .size([svg_width - 20, svg_height - 160])
    .node_circle_size(config.node.size) // 节点圆圈大小
  // var attribute_to_color = d3.scale.category10();
  var standard_label = tree.branch_name();

  tree.branch_name(function (node) { // 最右侧 label 名字
    return standard_label(node) + " ";
  });

  tree(d3.layout.newick_parser(treeData));
  // tree.spacing_x(10).spacing_y(20);

  var maximum_length = 0;
  tree.traverse_and_compute(function (node) {
    if (d3.layout.phylotree.is_leafnode(node)) {
      maximum_length = maximum_length < node.name.length ? node.name.length : maximum_length;
    }
  });

  tree.style_nodes(function (element, node_data, i) {
    // 右边的小方块和label
    if (node_data.name in configData) {
      var font_size = d3.layout.fontSize;
      var move_past_label = maximum_length * 0.57 * font_size;
      var x_shift = tree.shift_tip(node_data)[0] + move_past_label;
      var node_item = configData[node_data.name], i = 0;
      // element.select('.qweqw')
      var identity_genus = node_item.identity_genus ? node_item.identity_genus : {};
      var flag = node_item.flag ? node_item.flag : {};
      var random = node_item.random ? node_item.random : {};

      element.selectAll('.genus').remove();
      element.selectAll('.flag').remove();
      element.selectAll('.random').remove();
      element.selectAll('rect').remove();
      element.selectAll('circle').remove();
      element.selectAll('polygon').remove();

      if (labelConfig.identity_genus.position === 1) {
        shape_select(element, identity_genus, x_shift, font_size, i, 'genus')
        i = i + 1;
      } else if (labelConfig.flag.position === 1) {
        shape_select(element, flag, x_shift, font_size, i, 'flag')
        i = i + 1;
      } else if (labelConfig.random.position === 1) {
        shape_select(element, random, x_shift, font_size, i, 'random')
        i = i + 1;
      }

      if (labelConfig.identity_genus.position === 2) {
        shape_select(element, identity_genus, x_shift, font_size, i, 'genus')
        i = i + 1;
      } else if (labelConfig.flag.position === 2) {
        shape_select(element, flag, x_shift, font_size, i, 'flag')
        i = i + 1;
      } else if (labelConfig.random.position === 2) {
        shape_select(element, random, x_shift, font_size, i, 'random')
        i = i + 1;
      }

      if (labelConfig.identity_genus.position === 3) {
        shape_select(element, identity_genus, x_shift, font_size, i, 'genus')
      } else if (labelConfig.flag.position === 3) {
        shape_select(element, flag, x_shift, font_size, i, 'flag')
      } else if (labelConfig.random.position === 3) {
        shape_select(element, random, x_shift, font_size, i, 'random')
      }
    }
  });

  var distance = config.genus_legend.distance; //label间距
  function shape_select(element, item, x_shift, font_size, i, classs) {
    var fill = item.color ? item.color : '#ccc';

    var range = labelConfig.identity_genus ? labelConfig.identity_genus.length : [0, 1];

    var length = item.length ? (item.length / range[1] * distance) : 0;
    console.log(item.length / range[1]);

    switch (item.shape) {
      case 'square'://长方形
        element.append("rect").attr("width", font_size * 2).attr("height", font_size).attr("y", "-" + font_size * 0.7).style("fill", fill).attr("x", x_shift + font_size * i + i * distance + font_size * 0.3)
          .attr("cursor", "pointer")
          .append("title").text(item.label)
        // .on("mouseover", function (d, i) {
        //   element.select('.' + classs)
        //     .attr("style", "display: block;");
        // })
        // .on("mouseout", function (d, i) {
        //   // d3.select(this)
        //   element.select('.' + classs)
        //     .attr("style", "display: none;");
        // });

        break;
      case 'triangle'://三角形
        element.append("polygon").attr("points", "7.5,0 15,12 0,12").attr("style", 'fill:' + fill + '; stroke:black;stroke-width:0.5px;').attr("transform", "translate(" + (x_shift + font_size * i + i * distance + font_size * 0.6) + ",-" + font_size * 0.8 + ") scale(" + font_size * 0.08 + ")")
          .attr("cursor", "pointer")
          .append("title").text(item.label)
        break;
      case 'circle'://圆形
        element.append("circle").attr("cx", x_shift + font_size * i + i * distance + font_size * 1.2).attr("cy", "-" + font_size * 0.1).attr("r", font_size * 0.6).attr("style", 'fill:' + fill + '; stroke:black;stroke-width:0.5px;')
          .attr("cursor", "pointer")
          .append("title").text(item.label)
        break;
      case 'rhombus'://菱形
        element.append("polygon").attr("points", "10,10 17.5,5 25,10 17.5,15").attr("style", 'fill:' + fill + '; stroke:black;stroke-width:0.5px;').attr("transform", "translate(" + (x_shift + font_size * i + i * distance - distance / 2 + font_size * 0.8) + ",-" + font_size * 1.1 + ") scale(" + font_size * 0.1 + ")")
          .attr("cursor", "pointer")
          .append("title").text(item.label)
        break;
      default: //有长度
        var offset = length ? 0 : font_size * 0.8;
        var width = length === 0 ? font_size : length;
        // console.log(length);

        element.append("rect").attr("width", width).attr("height", font_size).attr("y", -font_size / 2).style("fill", fill).attr("x", x_shift + font_size * i + i * distance + offset)
          .attr("cursor", "pointer")
          .append("title").text(item.label)
        break;
    };
  }

  tree.layout();

  var fontSize = d3.layout.fontSize;
  //去除空格
  function trim(testStr) {
    testStr = testStr.replace(/\ +/g, ""); //去掉空格
    testStr = testStr.replace(/[ ]/g, "");    //去掉空格
    testStr = testStr.replace(/[\r\n]/g, ""); //去掉回车换行
    return testStr;
  }
  // 添加样式

  // d3.selectAll(".tree-selection-brush .extent").attr("fill-opacity", 0.05).attr("stroke", "#fff").attr("shape-rendering", "crispEdges")
  // d3.selectAll("tree-scale-bar text").attr("font", "sans-serif")
  // d3.selectAll(".tree-scale-bar line, .tree-scale-bar path").attr("fill", "none").attr("stroke", "#000").attr("shape-rendering", "crispEdges")
  // // d3.selectAll("circle").attr("fill", "#999")
  // d3.selectAll(".node").attr("fill", "10px sans-serif")
  // d3.selectAll(".node-selected").attr("fill", "#f00")
  // d3.selectAll(".node-collapsed circle, .node-collapsed ellipse, .node-collapsed rect").attr("fill", "black")
  // d3.selectAll(".node-tagged").attr("fill", "#00f")
  // d3.selectAll(".branch").attr("fill", "none").attr("stroke", "#999").attr("stroke-width", "2px")
  // d3.selectAll(".clade").attr("fill", "#1f77b4").attr("stroke", "#444").attr("stroke-width", "2px").attr("opacity", "0.5")
  // d3.selectAll(".branch-selected").attr("stroke", "#f00").attr("stroke-width", "3px")
  // d3.selectAll(".branch-tagged").attr("stroke", "#00f").attr("stroke-width", "2px").attr("stroke-dasharray", "10,5")
  // d3.selectAll(".branch-tracer").attr("stroke", "#bbb").attr("stroke-width", "1px").attr("stroke-dasharray", "3,4")
  // d3.selectAll(".branch-multiple").attr("stroke-dasharray", "5, 5, 1, 5").attr("stroke-width", "3px")

  // 刷新时删除图例，防止重复出现
  d3.select("#genus-legend").remove();
  d3.select("#flag-legend").remove();
  d3.select("#random-legend").remove();
  d3.select("#flag-legend-button").remove();
  d3.select("#genus-legend-button").remove();
  d3.select("#random-legend-button").remove();

  var leftOffsetObj = document.querySelector('.domain').getBoundingClientRect();
  leftOffset = leftOffsetObj.width + leftOffsetObj.x - 32 + fontSize;
  console.log(leftOffset);


  // 根据配置进行渲染
  var i = 0;
  if (labelConfig.identity_genus.position === 1) {
    identity_genus_fn()
    i = i + 1;
  } else if (labelConfig.flag.position === 1) {
    flag_fn()
    i = i + 1;
  } else if (labelConfig.random.position === 1) {
    random_fn()
    i = i + 1;
  }

  if (labelConfig.identity_genus.position === 2) {
    identity_genus_fn()
    i = i + 1;
  } else if (labelConfig.flag.position === 2) {
    flag_fn()
    i = i + 1;
  } else if (labelConfig.random.position === 2) {
    random_fn()
    i = i + 1;
  }

  if (labelConfig.identity_genus.position === 3) {
    identity_genus_fn()
  } else if (labelConfig.flag.position === 3) {
    flag_fn()
  } else if (labelConfig.random.position === 3) {
    random_fn()
  }

  //添加 identity_genus 图例
  function identity_genus_fn() {
    // 展开按钮
    var genusLegendButton = d3.select('#chart_svg').append("g").attr("id", "genus-legend-button").attr("transform", 'translate(' + (leftOffset + config.genus_legend.x + (distance + fontSize) * i + fontSize * 0.3) + ',' + config.genus_legend.y + ')').attr("cursor", "pointer")
      .on("click", function () {
        var d = d3.select('#genus-legend');
        d3.select('#flag-legend').attr("display", "none");
        d3.select('#random-legend').attr("display", "none");

        d3.select('#genus_path').attr("class", "");
        d3.select('#flag_path').attr("class", "");
        d3.select('#random_path').attr("class", "");

        if (d.attr("display") === 'block') {
          d.attr("display", "none");
        } else {
          d.attr("display", "block");
          d3.select('#genus_path').attr("class", "genus_path");;
        }

      });
    genusLegendButton.append("text").text("genus").attr("style", 'font-size: ' + fontSize * 0.9 + 'px;').attr("fill", "#666")
    genusLegendButton.append("g").attr("transform", "translate(" + fontSize * 2.6 + ",-6)").append("svg").attr("width", "8").attr("height", "8").attr("viewBox", "0 0 1792 1792").append("path").attr("d", "M1683 808l-742 741q-19 19-45 19t-45-19l-742-741q-19-19-19-45.5t19-45.5l166-165q19-19 45-19t45 19l531 531 531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z").attr("style", 'transform: rotate(-180deg); transform-origin: 50% 50% 0px; transition: all 350ms ease-in-out 0s;').attr("fill", "#666").attr("id", "genus_path")

    // 图例内容
    var identity_genus_data = [], igObject = labelConfig.identity_genus.legend.color, bgcHigth = 0;
    for (var key in igObject) {
      bgcHigth = bgcHigth + config.genus_legend.space + fontSize
      identity_genus_data.push({ name: igObject[key], color: key })
    };
    bgcHigth = bgcHigth + config.genus_legend.padding * 2;
    var genus_box = d3.select('#chart_svg').append("g").attr("id", "genus-legend").attr("transform", 'translate(' + (leftOffset + config.genus_legend.x + (distance + fontSize) * i - 50) + ',' + (config.genus_legend.y + 7) + ')').attr("display", config.genus_legend.show ? "block" : "none")

    genus_box.append("rect").attr("width", 170).attr("height", bgcHigth).attr("style", "fill:rgba(255,255,255,.9);stroke:rgba(0,0,0,.4);stroke-width: 0.3;") //背景

    var genus_legend = genus_box.selectAll(".genus-item").data(identity_genus_data).enter().append("g").attr("class", "genus-item")
      .attr("transform", function (item, i) {
        return 'translate(' + config.genus_legend.padding + ',' + ((config.genus_legend.space + fontSize) * i + config.genus_legend.padding) + ')'
      });

    genus_legend.append("rect").attr("width", fontSize * 1.5).attr("height", fontSize * 0.8).attr("fill", function (d) {
      return d.color
    }).attr("style", "stroke:#aaa;stroke-width:0.5;")

    genus_legend.append("text").attr("x", fontSize * 2).attr("y", fontSize / 2 + 4).text(function (obj) { return obj.name })
      .attr("style", 'font-size: ' + fontSize * 0.9 + 'px;')
      .attr("fill", "#999")

  }


  //添加 flag 图例
  function flag_fn() {

    // 展开按钮
    var flagLegendButton = d3.select('#chart_svg').append("g").attr("id", "flag-legend-button").attr("transform", 'translate(' + (leftOffset + config.genus_legend.x + (distance + fontSize) * i + fontSize * 0.7) + ',' + config.genus_legend.y + ')').attr("cursor", "pointer")
      .on("click", function () {
        var d = d3.select('#flag-legend');
        d3.select('#genus-legend').attr("display", "none");
        d3.select('#random-legend').attr("display", "none");

        d3.select('#genus_path').attr("class", "");
        d3.select('#flag_path').attr("class", "");
        d3.select('#random_path').attr("class", "");

        if (d.attr("display") === 'block') {
          d.attr("display", "none");
        } else {
          d.attr("display", "block");
          d3.select('#flag_path').attr("class", "flag_path");
        }

      });
    flagLegendButton.append("text").text("flag").attr("style", 'font-size: ' + fontSize * 0.9 + 'px;').attr("fill", "#666")
    flagLegendButton.append("g").attr("transform", "translate(" + fontSize * 1.6 + ",-6)").append("svg").attr("width", "8").attr("height", "8").attr("viewBox", "0 0 1792 1792").append("path").attr("d", "M1683 808l-742 741q-19 19-45 19t-45-19l-742-741q-19-19-19-45.5t19-45.5l166-165q19-19 45-19t45 19l531 531 531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z").attr("style", 'transform: rotate(-180deg); transform-origin: 50% 50% 0px; transition: all 350ms ease-in-out 0s;').attr("fill", "#666").attr("id", "flag_path")

    // 图例内容
    var flagLegend = labelConfig.flag.legend.shape, bgcHigth = 0;
    var flag_box = d3.select('#chart_svg').append("g").attr("id", "flag-legend").attr("transform", 'translate(' + (leftOffset + config.genus_legend.x + (distance + fontSize) * i - 10) + ',' + (config.genus_legend.y + 7) + ')').attr("display", config.genus_legend.show ? "block" : "none");
    var flag_bgc = flag_box.insert("rect").attr("fill", "rgba(255,255,255,.9)").attr("style", "stroke:rgba(0,0,0,.4);stroke-width: 0.3;") //背景
    for (var key in flagLegend) {
      bgcHigth = bgcHigth + config.genus_legend.space + fontSize;
      var flag_g = flag_box.append("g").attr("class", "flag-item").attr("transform", 'translate(' + config.genus_legend.padding + ',' + bgcHigth + ')');
      var text_x = fontSize * 2, text_y = fontSize / 2 + 4;
      switch (key) {
        case 'square'://长方形
          flag_g.append("rect").attr("width", fontSize).attr("height", fontSize * 0.7).attr("style", 'fill:' + config.flag_legend.color + '; stroke:black;stroke-width:0.5px;')
            .append("title").text(flagLegend[key])
          break;
        case 'circle'://圆形
          text_y = text_y - 5
          flag_g.append("circle").attr("r", fontSize * 0.5).attr("style", 'fill:' + config.flag_legend.color + '; stroke:black;stroke-width:0.5px;')
            .attr("cx", fontSize * 0.4).attr("cy", 0)
            .append("title").text(flagLegend[key])
          break;
        case 'rhombus'://菱形
          text_y = text_y - 1
          flag_g.append("polygon").attr("points", "10,10 17.5,5 25,10 17.5,15").attr("style", 'fill:' + config.flag_legend.color + '; stroke:black;stroke-width:0.5px;').attr("transform", "translate(-" + fontSize * 0.9 + ",-" + fontSize / 2 + ") scale(" + fontSize * 0.08 + ")")
            .append("title").text(flagLegend[key])
          break;
        case 'triangle'://三角形
          flag_g.append("polygon").attr("points", "7.5,0 15,12 0,12").attr("style", 'fill:' + config.flag_legend.color + '; stroke:black;stroke-width:0.5px;')
            .attr("transform", "translate(0,0) scale(" + fontSize * 0.07 + ")")
            .append("title").text(flagLegend[key])
          break;
        // default: //长方形
        //   flag_g.append("rect").attr("width", fontSize + length).attr("height", fontSize).style("fill", config.flag_legend.color)
        //     // .attr("x", 0).attr("y", -fontSize / 2)
        //     .append("title").text(flagLegend[key])
        //   break;
      }
      flag_g.append("text").attr("x", text_x).attr("y", text_y).text(flagLegend[key])
        .attr("style", 'font-size: ' + fontSize * 0.9 + 'px;')
        .attr("fill", "#999")
    };
    bgcHigth = bgcHigth + config.genus_legend.padding * 2;
    flag_bgc.attr("width", 60).attr("height", bgcHigth);
  }

  //添加 random 图例
  function random_fn() {
    // 展开按钮
    var randomLegendButton = d3.select('#chart_svg').append("g").attr("id", "random-legend-button").attr("transform", 'translate(' + (leftOffset + config.genus_legend.x + (distance + fontSize) * i + fontSize * 0.3) + ',' + (config.genus_legend.y) + ')').attr("cursor", "pointer")
      .on("click", function () {
        var d = d3.select('#random-legend');
        d3.select('#genus-legend').attr("display", "none");
        d3.select('#flag-legend').attr("display", "none");

        d3.select('#genus_path').attr("class", "");
        d3.select('#flag_path').attr("class", "");
        d3.select('#random_path').attr("class", "");

        if (d.attr("display") === 'block') {
          d.attr("display", "none");
        } else {
          d.attr("display", "block");
          d3.select('#random_path').attr("class", "random_path");
        }

      });
    randomLegendButton.append("text").text("random").attr("style", 'font-size: ' + fontSize * 0.9 + 'px;').attr("fill", "#666")
    randomLegendButton.append("g").attr("transform", "translate(" + fontSize * 3.2 + ",-6)").append("svg").attr("width", "8").attr("height", "8").attr("viewBox", "0 0 1792 1792").append("path").attr("d", "M1683 808l-742 741q-19 19-45 19t-45-19l-742-741q-19-19-19-45.5t19-45.5l166-165q19-19 45-19t45 19l531 531 531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z").attr("style", 'transform: rotate(-180deg); transform-origin: 50% 50% 0px; transition: all 350ms ease-in-out 0s;').attr("fill", "#666").attr("id", "random_path")

    // 图例内容
    var random_data = [], igObject = labelConfig.random.legend.color, bgcHigth = 0;
    for (var key in igObject) {
      bgcHigth = bgcHigth + config.genus_legend.space + fontSize
      random_data.push({ name: igObject[key], color: key })
    };
    bgcHigth = bgcHigth + config.genus_legend.padding * 2;
    var genus_box = d3.select('#chart_svg').append("g").attr("id", "random-legend").attr("transform", 'translate(' + (leftOffset + config.genus_legend.x + (distance + fontSize) * i - 10) + ',' + (config.genus_legend.y + 7) + ')').attr("display", config.genus_legend.show ? "block" : "none")

    genus_box.append("rect").attr("width", 60).attr("height", bgcHigth).attr("fill", "rgba(255,255,255,.9)").attr("style", "stroke:rgba(0,0,0,.4);stroke-width: 0.3;") //背景

    var genus_legend = genus_box.selectAll(".random-item").data(random_data).enter().append("g").attr("class", "random-item")
      .attr("transform", function (item, i) {
        return 'translate(' + config.genus_legend.padding + ',' + ((config.genus_legend.space + fontSize) * i + config.genus_legend.padding) + ')'
      });

    genus_legend.append("rect").attr("width", fontSize).attr("height", fontSize).attr("fill", function (d) {
      return d.color
    }).attr("style", "stroke:#aaa;stroke-width:0.5;")

    genus_legend.append("text").attr("x", fontSize * 2).attr("y", fontSize / 2 + 4).text(function (obj) { return obj.name })
      .attr("style", 'font-size: ' + fontSize * 0.9 + 'px;')
      .attr("fill", "#999")
  }






  // 鼠标拖动初始化
  DivMove("#flag-legend", "#flag-legend-button");
  DivMove("#genus-legend", "#genus-legend-button");
  DivMove("#random-legend", "#random-legend-button");

  // 树和比例尺的偏移量
  var dom_g = document.querySelector('#chart_g');
  // var g_width = dom_g.getBoundingClientRect().width;
  var g_height = dom_g.getBoundingClientRect().height;
  chart_g.attr("transform", "translate(0," + ((svg_height - g_height) / 2) + ") scale(1)")

  var phylotreeContainer = document.querySelector('.phylotree-container');
  d3.select(".tree-scale-bar").attr("transform", "translate(" + (config.leftOffset - 30) + "," + (phylotreeContainer.getBoundingClientRect().height - fontSize + 5) + ")")

  d3.select(".phylotree-container").attr("transform", "translate(" + config.leftOffset + ",-10)")
}


// 初始化
// init_tree(example_tree_text);
init_tree(example_tree_16s);
// init_tree(example_tree2);
// init_tree(iTOL_salmonella_new);
// init_tree(fasttree);


/************************* 交互部分 *****************************/

// 重置
$("#reset").on("click", function (e) {
  init_tree(example_tree_16s);
});
// 上下左右放大缩小事件
$("[data-direction]").on("click", function (e) {
  var which_function = $(this).data("direction") == 'vertical' ? tree.spacing_x : tree.spacing_y;
  which_function(which_function() + (+ $(this).data("amount"))).update();
});


// 正序、倒序、复原排列
function sort_nodes(asc) {
  tree.traverse_and_compute(function (n) {
    var d = 1;
    if (n.children && n.children.length) {
      d += d3.max(n.children, function (d) { return d["count_depth"]; });
    }
    n["count_depth"] = d;
  });
  tree.resort_children(function (a, b) {
    return (a["count_depth"] - b["count_depth"]) * (asc ? 1 : -1);
  });
}
$("#sort_original").on("click", function (e) {
  tree.resort_children(function (a, b) {
    return a["original_child_order"] - b["original_child_order"];
  });
});

$("#sort_ascending").on("click", function (e) {
  sort_nodes(true);
});

$("#sort_descending").on("click", function (e) {
  sort_nodes(false);
});

// $("[data-mode='" + (tree.radial() ? 'radial' : 'linear') + "']").on("click", function (e) {
$("#radial").on("click", function (e) {
  tree.radial(true).placenodes().update()
});
$("#linear").on("click", function (e) {
  tree.radial(false).placenodes().update()
});

$("#toggle_animation").on("click", function (e) {
  var current_mode = $(this).hasClass('active');
  $(this).toggleClass('active');
  isTransitions = !current_mode
  tree.options({ 'transitions': isTransitions });
});

// 左右对齐
$("#tip_left").on("click", function (e) {
  tree.align_tips(true).update()
});
$("#tip_right").on("click", function (e) {
  tree.align_tips(false).update()
});

// 上下步
$("#prev-step").on("click", function (e) {
  if (stepIndex >= 1) {
    stepIndex = stepIndex - 1;
    init_tree(stepArrData[stepIndex], true);
  } else {
    stepIndex = 0
    alert('已经到第一步，无法进行上一步！')
  }

});
$("#next-stept").on("click", function (e) {
  if (stepIndex < stepArrData.length - 1) {
    stepIndex = stepIndex + 1;
    init_tree(stepArrData[stepIndex], true);
  } else {
    stepIndex = stepArrData.length - 1
    alert('已经到最后一步，无法进行下一步！')
  }
});

// 保存.tree文件
$("#save-file").on("click", function (e) {
  exportRaw('data.tree', treeData);
});
// 保存.svg文件
$("#save-file-svg").on("click", function (e) {
  var html = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'
  $("#chart_svg").attr("viewBox", "0 0 1030 1024")
  exportRaw('file.svg', html + $("#svg-box").html());
});



function fakeClick(obj) {
  var ev = document.createEvent("MouseEvents");
  ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  obj.dispatchEvent(ev);
}

function exportRaw(name, data) {
  var urlObject = window.URL || window.webkitURL || window;
  var export_blob = new Blob([data]);
  var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
  save_link.href = urlObject.createObjectURL(export_blob);
  save_link.download = name;
  fakeClick(save_link);
}


// 图片下载
$("#save-img-jpg").on("click", function (e) {
  // covertSVG2Image(dom_svg, 'sdsc', svg_width, svg_height, 'png')
  //   backgroundColor - 使用给定的background 颜色创建 PNG。 默认为透明。
  // left - 指定viewbox位置的左边。 默认为 0.
  // height - 指定图像的高度。 如果给定的是，或者元素高度的边界或者元素高度的CSS，或者 0的计算高度，则默认为，。
  // scale - 更改输出PNG的分辨率。 默认为 1，与源SVG相同的维度。
  // selectorRemap - 一个接受CSS选择器并在CSS中生成内联到SVG中的更换的函数。 如果SVG样式选择器是由HTML文档中的祖先元素限定的，则有用。
  // modifyStyle - 使用CSS样式并返回替换样式的函数。
  // top - 指定viewbox位置的顶部。 默认为 0.
  // width - 指定图像的宽度。 如果给定的是，或者元素宽度的边界或者元素宽度的CSS，或者 0的计算宽度，默认为，。
  // encoderType - 指示图像格式的DOMString。 默认类型为图像/png。
  // encoderOptions - 0和 1之间的数字表示图像质量。 默认值为 0.8
  // canvg - 如果传入了 canvg，它将用于将svg写入画布。 这将允许对 IE的支持
  saveSvgAsPng(d3.select('#chart_svg').node(), "diagram.jpg", { backgroundColor: "#ffffff" });
});
// $("#save-img").on("click", function (e) {
//   saveSvgAsPng(d3.select('#chart_svg').node(), "diagram.jpg", { backgroundColor: "#ffffff" });
// });



// 鼠标拖动事件
function DivMove(obj, ele) {

  $(obj).mousedown(function (e) {
    $(obj).css("cursor", "move");//改变鼠标指针样式
    var x = e.offsetX; //获取div的当前X坐标
    var y = e.offsetY;  //获取div的当前X坐标
    var str = $(obj).attr("transform");
    console.log(x, y);

    var arr = str.slice(str.indexOf("(") + 1, str.indexOf(")")).split(',');
    console.log(arr);

    $(document).bind("mousemove", function (ev) {//鼠标移动事件
      var ox = ev.offsetX - x;
      var oy = ev.offsetY - y;
      // console.log(ev.offsetX);
      // console.log(ev.offsetY);


      // $(ele).attr("transform", "translate(" + (arr[0] * 1 + ox) + "," + (oy + arr[1] * 1) + ")")
      $(obj).attr("transform", "translate(" + (arr[0] * 1 + ox - 10) + "," + (oy + arr[1] * 1 + 7) + ")")
      // $(obj).attr("transform")
      // console.log($(obj).attr("transform",));
      console.log(ox, oy);
      // console.log(e.pageX, e.pageY);
    });
  })
  $(document).mouseup(function () {
    $(obj).css("cursor", "default");//还原鼠标指针样式
    $(this).unbind("mousemove");
  });
}


// 菜单项
var menu = $("#right_click_menu");
document.querySelector("#chart_svg").oncontextmenu = function (ev) {
  var ev = ev || event;
  var scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  menu.attr("style", "display:block;left:" + ev.clientX + "px;top:" + (ev.clientY + scrollTop) + "px");
  //阻止默认事件
  return false;
};
var app = document.querySelector('body');
app.onclick = function () {
  menu.attr("style", "display:none;");
};