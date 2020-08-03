import paper from 'paper';

PaperGroup.prototype = {
  constructor: PaperGroup,
  draw: function () {
    // Create rectangle shapes
    let rectangle = new paper.Rectangle(
      new paper.Point(this.x + 10, this.y),
      new paper.Size(this.width - this.x - 20, this.groupHeight)
    );
    if (this.viewingMode) {
      rectangle = new paper.Rectangle(
        new paper.Point(this.x + 10, this.y),
        new paper.Size(this.width - this.x, this.groupHeight)
      );
    }
    let highlightRectangle = rectangle.clone();
    highlightRectangle.set(
      new paper.Point(this.x, this.y - 10),
      new paper.Size(this.width - this.x, this.groupHeight + 20)
    );

    // Create path from rectangle
    this.path = new paper.Path.Rectangle(rectangle);
    if (this.isActive) {
      this.path.fillColor = this.groupColorActive;
    } else {
      this.path.fillColor = this.groupColor;
    }
    if (this.group.nestLevel % 2 === 0) {
      this.path.fillColor.brightness -= 0.05;
    }
    this.path.name = 'group ' + this.groupOrder;

    // Create highlight path from rectangle
    this.highlight = new paper.Path.Rectangle(highlightRectangle);
    this.highlight.fillColor = new paper.Color(
      112 / 255.0,
      229 / 255.0,
      220 / 255.0,
      1
    );
    this.highlight.opacity = 0;
    this.highlight.name = 'group ' + this.groupOrder + ' highlight';
    this.highlight.insertBelow(this.path);

    this.filterHighlight = new paper.Path.Rectangle(highlightRectangle);
    this.filterHighlight.fillColor = this.filterColor;
    this.filterHighlight.opacity = 0;
    this.filterHighlight.insertBelow(this.path);

    // Set highlight path to be at the back
    paper.project.activeLayer.insertChild(0, this.highlight);
    paper.project.activeLayer.insertChild(0, this.filterHighlight);
  },
  setMouseEventHandlers: function () {
    // Set mouse event handlers
    let that = this;
    this.path.onClick = function (event) {
      that.handleObjectClick(that.group, event);
    };
    this.path.onMouseEnter = function (event) {
      document.body.style.cursor = 'pointer';
    };
    this.path.onMouseLeave = function (event) {
      document.body.style.cursor = 'default';
    };
  },
  removeMouseEventHandlers: function () {
    this.path.onClick = function (event) {};
    this.path.onMouseEnter = function (event) {};
    this.path.onMouseLeave = function (event) {};
  },
  activate: function () {
    this.path.fillColor = this.groupColorActive;
    this.isActive = true;
    this.highlight.opacity = 0.75;
    this.highlight.fillColor = '#ffffff';
  },
  deactivate: function () {
    this.path.fillColor = this.groupColor;
    if (this.group.nestLevel % 2 === 0) {
      this.path.fillColor.brightness -= 0.05;
    }
    this.isActive = false;
    this.highlight.opacity = 0;
    this.highlight.fillColor = new paper.Color(
      112 / 255.0,
      229 / 255.0,
      220 / 255.0,
      1
    );
  },
  setVisibility: function (visibleAttributes) {
    this.visibleAttributes = visibleAttributes;
    let groupText = this.group.type + ' ' + this.groupOrder;
    if (this.visibleAttributes && this.visibleAttributes.title)
      groupText = groupText + ': ' + this.group.title;
    this.text.set({
      content: groupText,
    });
  },
};
// Constructor for group
function PaperGroup(args) {
  this.manager = args.manager;
  this.group = args.group;
  this.groupOrder = args.groupIDs.indexOf(args.group.id) + 1;
  this.y = args.y;
  this.x = args.x;
  this.width = args.width;
  this.groupHeight = args.groupHeight;
  this.isActive = args.isActive;
  this.highlight = new paper.Path();
  this.filterHighlight = new paper.Path();
  this.path = new paper.Path();
  this.groupColor = args.groupColor;
  this.groupColorActive = args.groupColorActive;
  this.textColor = args.textColor;
  this.filterColor = args.filterColor;
  this.handleObjectClick = args.handleObjectClick;
  this.visibleAttributes = {};
  this.viewingMode = args.viewingMode;
  this.text = new paper.PointText({
    point: [this.x + args.spacing * 0.6, this.y + args.spacing * 0.6],
    fillColor: this.textColor,
    fontSize: args.spacing * 0.48,
  });
  this.setVisibility(args.visibleAttributes);
}
export default PaperGroup;
