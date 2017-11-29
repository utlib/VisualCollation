import paper from 'paper';

PaperLeaf.prototype = {
    constructor: PaperLeaf,
    draw: function() {
        // Call this function only after ALL leaves have been instantiated
        // This is because we need all leaves present in order
        // to compute their indentations relative to each other
        this.setIndent();
        // Draw horizontal part
        let x1 = this.multiplier<1? 10 + this.indent*this.spacing*this.multiplier : this.indent*this.spacing*this.multiplier;
        let x2 = this.width;
        this.path.add(new paper.Point(x1, this.y));
        if (this.leaf.stub !== "None") {
            x2 = this.width*0.15+x1;
        }
        this.path.add(new paper.Point(x2, this.y));
        // Draw vertical part
        if (this.isConjoined()) {
            var conjoinY=this.y_conjoin_center(this.conjoined_to);
            this.path.insert(0, new paper.Point(this.path.segments[0].point.x, conjoinY));
        }
        this.curveMe();

        this.path.name = "leaf " + this.order;

        // Create highlight path
        this.highlight = this.path.clone();
        this.highlight.dashArray = [0, 0];
        this.highlight.segments[this.highlight.segments.length-1].point.x = this.highlight.segments[this.highlight.segments.length-1].point.x + 5;
        if (this.leaf.conjoined_leaf_order === "Binding" || this.leaf.conjoined_leaf_order === "None") {
            this.highlight.segments[0].point.x = this.highlight.segments[0].point.x - 5;
        }
        this.highlight.strokeColor = this.strokeColorActive;
        this.highlight.strokeWidth = this.path.strokeWidth*2;
        this.highlight.opacity = 0;
        this.highlight.name = "leaf " + this.order + " highlight";
        this.highlight.insertBelow(this.path);

        if (this.isActive) {
            this.highlight.opacity = 0.35;
            this.highlight.strokeWidth = this.path.strokeWidth*2;
            this.highlight.strokeColor = "#ffffff";
        }
        
        this.filterHighlight = this.path.clone();
        this.filterHighlight.dashArray = [0, 0];
        this.filterHighlight.segments[this.filterHighlight.segments.length-1].point.x = this.filterHighlight.segments[this.filterHighlight.segments.length-1].point.x + 5;
        if (this.leaf.conjoined_leaf_order === "Binding" || this.leaf.conjoined_leaf_order === "None") {
            this.filterHighlight.segments[0].point.x = this.filterHighlight.segments[0].point.x - 5;
        }
        this.filterHighlight.strokeColor = this.strokeColorFilter;
        this.filterHighlight.strokeWidth = this.path.strokeWidth*2;
        this.filterHighlight.opacity = 0;
        this.filterHighlight.insertBelow(this.path);

        // this.path.fullySelected = true;
        this.showAttributes();
        this.createAttachments();

        const leafNotesToShow = this.leaf.notes.filter((noteID)=>{return this.Notes[noteID].show});
        const rectoNotesToShow = this.recto.notes.filter((noteID)=>{return this.Notes[noteID].show});
        const versoNotesToShow = this.verso.notes.filter((noteID)=>{return this.Notes[noteID].show});

        let textX = 0;
        let textY = this.y;
        let fontSize = this.spacing*0.50;
        let numChars = this.path.bounds.width/fontSize*2.4;

        if (this.isConjoined()) {
            // This leaf is conjoined
            textX = this.path.segments[1].point.x;
        } else {
            // Separate leaf
            textX = this.path.segments[0].point.x + 10;
        }
        if (this.leaf.attached_above.includes("Partial")) {
            // This leaf has a partial glue attachment
            // Place text to the right of attachment drawing
            textX = this.attachment.bounds.right+5;
        } else if (this.leaf.attached_above.includes("Glued")) {
            // Other type of glueing exists
            textY -= this.spacing*0.7;
        } 
        
        let that = this;
        // Draw recto note text
        for (let noteIndex = 0; noteIndex < rectoNotesToShow.length; noteIndex++) {
            const note = this.Notes[rectoNotesToShow[noteIndex]];
            let textNote = new paper.PointText({
                content: "▼ " + this.recto.folio_number + " : " + note.title.substr(0,numChars),
                point: [textX, textY - noteIndex*(this.spacing*0.7) - this.spacing*0.3],
                fillColor: this.strokeColor,
                fontSize: fontSize,
            });
            textNote.onClick = function(event) {
                that.openNoteDialog(note);
            };
            this.textNotes.addChild(textNote);
        }
        // Draw leaf note text
        for (let noteIndex = 0; noteIndex < leafNotesToShow.length; noteIndex++) {
            const note = this.Notes[leafNotesToShow[noteIndex]];
            
            let textNote = new paper.PointText({
                content: "▼ L" + this.leaf.order + " : " + note.title.substr(0,numChars),
                point: [textX, textY - rectoNotesToShow.length*(this.spacing*0.7) - noteIndex*(this.spacing*0.7) - this.spacing*0.3],
                fillColor: this.strokeColor,
                fontSize: fontSize,
            });
            textNote.onClick = function(event) {
                that.openNoteDialog(note);
            };
            this.textNotes.addChild(textNote);
        }
        // Draw verso note text
        for (let noteIndex = 0; noteIndex < versoNotesToShow.length; noteIndex++) {
            const note = this.Notes[versoNotesToShow[noteIndex]];
            let textNote = new paper.PointText({
                content: "▲ " + this.verso.folio_number + " : " + note.title.substr(0,numChars),
                point: [textX, this.y + noteIndex*(this.spacing*0.7) + this.spacing*0.8],
                fillColor: this.strokeColor,
                fontSize: fontSize,
            });
            textNote.onClick = function(event) {
                that.openNoteDialog(note);
            };
            this.textNotes.addChild(textNote);
        }
        this.textNotes.onMouseEnter = function(event) {
            document.body.style.cursor = "pointer";
        }
        this.textNotes.onMouseLeave = function(event) {
            document.body.style.cursor = "default";
        }
        return this;
    },
    setMouseEventHandlers: function() {
        // Set mouse event handlers
        let that = this;
        this.path.onClick = function(event) {
            that.handleObjectClick(that.leaf, event);
        };
        this.textLeafOrder.onClick = function(event) {
            that.handleObjectClick(that.leaf, event);
        };
        this.textRecto.onClick = function(event) {
            that.handleObjectClick(that.leaf, event);
        };
        this.textVerso.onClick = function(event) {
            that.handleObjectClick(that.leaf, event);
        };
        this.path.onMouseEnter = function(event) {
            document.body.style.cursor = "pointer";
        }
        this.path.onMouseLeave = function(event) {
            document.body.style.cursor = "default";
        }
        this.textLeafOrder.onMouseEnter = function(event) {
            document.body.style.cursor = "pointer";
        }
        this.textLeafOrder.onMouseLeave = function(event) {
            document.body.style.cursor = "default";
        }
        this.textRecto.onMouseEnter = function(event) {
            document.body.style.cursor = "pointer";
        }
        this.textRecto.onMouseLeave = function(event) {
            document.body.style.cursor = "default";
        }
        this.textVerso.onMouseEnter = function(event) {
            document.body.style.cursor = "pointer";
        }
        this.textVerso.onMouseLeave = function(event) {
            document.body.style.cursor = "default";
        }
    },
    removeMouseEventHandlers: function() {
        // Set mouse event handlers
        this.path.onClick = function(event) {};
        this.textLeafOrder.onClick = function(event) {};
        this.textRecto.onClick = function(event) {};
        this.textVerso.onClick = function(event) {};
        this.path.onMouseEnter = function(event) {};
        this.path.onMouseLeave = function(event) {};
        this.textLeafOrder.onMouseEnter = function(event) {};
        this.textLeafOrder.onMouseLeave = function(event) {};
        this.textRecto.onMouseEnter = function(event) {};
        this.textRecto.onMouseLeave = function(event) {};
        this.textVerso.onMouseEnter = function(event) {};
        this.textVerso.onMouseLeave = function(event) {};
    },
    createAttachments: function() {
        if (this.order>1 && this.leaf.attached_above.includes("Glued")) {
            this.createGlue();
        } else if (this.order>1 && this.leaf.attached_above==="Other") {
            this.createOtherAttachment();
        } 
        if (this.order>1 && this.leaf.conjoin_type==="Sewn") {
            this.createSewn();
        }
    },
    createGlue: function() {
        let x = this.path.segments[0].point.x;
        if (this.isConjoined() && this.conjoined_to<this.order) {
            if (this.conjoined_to+1===this.order) {
                x += this.strokeWidth;
            } else {
                x = this.prevPaperLeaf().path.segments[0].point.x;
            }
        }
        if (this.leaf.attached_above.includes("Partial")) {
            for (let i=0; i<6; i++) {
                let glueLine = new paper.Path();
                glueLine.add(new paper.Point(x, this.y-this.spacing*0.3));
                glueLine.add(new paper.Point(x+10, this.y-this.spacing*0.7));
                glueLine.strokeColor = "#707070";
                glueLine.strokeWidth = 2;
                this.attachment.addChild(glueLine);
                x += 5;
            }
        } else if (this.leaf.attached_above.includes("Drumming")) {
            let glueLineCount = 15;
            if (this.leaf.stub!=="None") glueLineCount = 4;
            // Draw left drum glue
            for (let i=0; i<glueLineCount; i++) {
                let glueLine = new paper.Path();
                glueLine.add(new paper.Point(x, this.y-this.spacing*0.3));
                glueLine.add(new paper.Point(x+10, this.y-this.spacing*0.7));
                glueLine.strokeColor = "#707070";
                glueLine.strokeWidth = 2;
                this.attachment.addChild(glueLine);
                x += 5;
            }
            // Draw right drum glue
            x = this.path.segments[this.path.segments.length-1].point.x;
            for (let i=0; i<glueLineCount; i++) {
                let glueLine = new paper.Path();
                glueLine.add(new paper.Point(x-10, this.y-this.spacing*0.3));
                glueLine.add(new paper.Point(x, this.y-this.spacing*0.7));
                glueLine.strokeColor = "#707070";
                glueLine.strokeWidth = 2;
                this.attachment.addChild(glueLine);
                x -= 5;
            }
        } else {
            // Complete glue
            while (x <= (this.path.segments[this.path.segments.length-1].point.x-10)) {
                let glueLine = new paper.Path();
                glueLine.add(new paper.Point(x, this.y-this.spacing*0.3));
                glueLine.add(new paper.Point(x+10, this.y-this.spacing*0.7));
                glueLine.strokeColor = "#707070";
                glueLine.strokeWidth = 2;
                this.attachment.addChild(glueLine);
                x += 5;
            }
        }
    },
    // Sewing of conjoined leaves
    createSewn: function() {
        if (this.isConjoined() && this.conjoined_to<this.order) {
            let x = this.path.segments[0].point.x;
            for (let i=0; i<2; i++) {
                let thread = new paper.Path();
                thread.add(new paper.Point(x-1, this.y_conjoin_center(this.conjoined_to)-5));
                thread.add(new paper.Point(x-1, this.y_conjoin_center(this.conjoined_to)+5));
                thread.strokeColor = "#ffffff";
                thread.strokeWidth = 1;
                this.attachment.addChild(thread);
                x += 3;
            }
        }
    },
    createOtherAttachment: function() {
        let x = this.path.segments[0].point.x;
        if (this.isConjoined() && this.conjoined_to<this.order) {
            if (this.conjoined_to+1===this.order) {
                x += this.strokeWidth;
            } else {
                x = this.prevPaperLeaf().path.segments[0].point.x;
            }
        }
        for (let i=0; i<6; i++) {
            let attachLine = new paper.Path();
            attachLine.add(new paper.Point(x, this.y-10));
            attachLine.add(new paper.Point(x, this.y-20));
            attachLine.strokeColor = "#707070";
            attachLine.strokeWidth = 2;
            this.attachment.addChild(attachLine);
            x += 5;
        }
    },
    isConjoined: function() {
        return this.conjoined_to>0;
    },
    conjoinedLeaf: function() {
        return this.manager.getLeaf(this.conjoined_to);
    },
    y_conjoin_center: function(conjoin_order) {
        var y1 =  this.path.segments[1].point.y;
        var y2 =  (this.manager.getLeaf(conjoin_order)).getY();
        return y1+((y2-y1)/2.0);
    },
    y_nonconjoin_center: function() {
        var y = this.y
        var y_center = this.y_centerQuire();
        if (y===y_center) {
            return y_center;
        } else if (y<y_center) {
            var val = this.y_nextPaperLeaf()-this.spacing*0.3;
            return val;
        } else {
            val = this.y_prevLeaf()-this.spacing*0.3;
            return val;
        }
    },
    prevPaperLeaf: function() {
        // Previous leaf better exist or else!
        return this.manager.getLeaf(this.order-1);
    },
    y_prevLeaf: function() {
        if (this.order-1<0) {
            return 0;
        } else {
            return this.manager.getLeaf(this.order).path.segments[1].point.y;
        }
    },
    y_nextPaperLeaf: function() {
        if (this.order+1 >= this.manager.numLeaves()) {
            return 0;
        } else {
            return this.manager.getLeaf(this.order+1).y;
        }
    },
    curveMe: function() {
        var path_height = Math.abs(this.path.segments[0].point.y - this.path.segments[1].point.y);
        var midpoint = this.path.segments[1].point;
        if (this.isConjoined() ) {
            var numLeavesInside = Math.abs(this.conjoined_to - this.order);
            // Remove the middle point and insert a new one with handles
            this.path.removeSegment(1);
            // // Calculate new point's location and radius
            var new_x = midpoint.x + 20;
            var radius = new_x - this.path.segments[0].point.x;
            var s1 = new paper.Segment(new paper.Point(new_x, midpoint.y), new paper.Point(-radius,0), null);
            this.path.insert(1, s1);

            if (numLeavesInside > 5) {
                // Modify first point's handle so that the curve isn't too curvy
                var direction = this.path.segments[0].point.y > this.path.segments[1].point.y? -1 : 1;
                var oldPoint = this.path.segments[0].point;
                this.path.removeSegment(0);
                var s0 = new paper.Segment(new paper.Point(oldPoint.x, oldPoint.y), null, new paper.Point(0,direction*(path_height)));
                this.path.insert(0, s0);
            }
        }
    },
    setIndent: function() {
        this.indent = this.leaf.nestLevel;
        if (this.isConjoined() && this.conjoinedLeaf().indent != null) {
            // Leaf is conjoined and conjoiner has indent, so copy that conjoiner's indent
            this.indent = this.conjoinedLeaf().indent;
        } else if (this.isBelowAConjoined()) {
            if (this.isConjoined()) {
                this.indent = (this.prevPaperLeaf().indent+1);
            } else {
                // The previous leaf is conjoined, so add 1 indent
                this.indent = (this.prevPaperLeaf().indent+1);
            }
        } else if (this.order>1 && this.parentOrder === this.prevPaperLeaf().parentOrder){
            // Leaf is a sibling of previous leaf, so copy sibling's indent
            this.indent = this.prevPaperLeaf().indent;
        }
    },
    isBelowAConjoined: function() {
        return (this.order>1 && this.prevPaperLeaf().isConjoined() && this.prevPaperLeaf().conjoined_to > this.order);
    },
    y_centerQuire: function () {
        var last_leaf =  this.manager.getLastLeaf().getY();
        return (last_leaf+ this.spacing)/2.0 ;
    },
    getY: function() {
        return this.y;
    },
    activate: function() {
        this.path.strokeColor = this.strokeColorActive;
        this.highlight.opacity = 0.35;
        this.highlight.strokeWidth = this.path.strokeWidth*2;
        this.highlight.strokeColor = "#ffffff";
    },
    deactivate: function() {
        this.highlight.opacity = 0;
        this.highlight.strokeWidth = this.path.strokeWidth;
        this.highlight.strokeColor = this.strokeColorActive;
        
        if (this.leaf.type==="Added") {
            this.path.strokeColor = this.strokeColorAdded;
        } else if (this.leaf.type==="Endleaf") {
            this.path.strokeColor = "#727272";
        } else {
            this.path.strokeColor = this.strokeColor;
        }
    },
    setVisibility: function(visibleAttributes) {
        this.visibleAttributes = visibleAttributes;
        this.showAttributes();
    },
    showAttributes: function() {
        if (this.visibleAttributes.side.folio_number && this.visibleAttributes.side.texture) {
            if (this.leaf.stub === "None") {
                // Reduce leaf width so we can fit attribute text
                this.path.segments[this.path.segments.length-1].point.x = this.width-this.spacing*2;
                this.highlight.segments[this.highlight.segments.length-1].point.x = this.width-this.spacing*1.8;
                this.filterHighlight.segments[this.filterHighlight.segments.length-1].point.x = this.width-this.spacing*1.8;
            }
            this.textLeafOrder.set({point: [this.width-this.spacing*1.8, this.textLeafOrder.point.y]});
            this.textRecto.set({point:[this.textLeafOrder.bounds.right+this.spacing*0.2, this.textRecto.point.y], content: this.recto.folio_number + "   " + this.recto.texture});
            this.textVerso.set({point:[this.textLeafOrder.bounds.right+this.spacing*0.2, this.textVerso.point.y], content: this.verso.folio_number + "   " + this.verso.texture});
        } else if (this.visibleAttributes.side.folio_number) {
            if (this.leaf.stub === "None") {
                // Reduce leaf width so we can fit folio number text
                this.path.segments[this.path.segments.length-1].point.x = this.width - this.spacing;
                this.highlight.segments[this.highlight.segments.length-1].point.x = this.width - this.spacing*0.8;
                this.filterHighlight.segments[this.filterHighlight.segments.length-1].point.x = this.width - this.spacing*0.8;
            }
            // Adjust text 
            this.textLeafOrder.set({point: [this.width-this.spacing*0.80, this.textLeafOrder.point.y]});
            this.textRecto.set({point:[this.textLeafOrder.bounds.right+this.spacing*0.2, this.textRecto.point.y], content: this.recto.folio_number});
            this.textVerso.set({point:[this.textLeafOrder.bounds.right+this.spacing*0.2, this.textVerso.point.y], content: this.verso.folio_number});
        } else if (this.visibleAttributes.side.texture) {
            if (this.leaf.stub === "None") {
                // Reduce leaf width so we can fit texture text
                this.path.segments[this.path.segments.length-1].point.x = this.width - this.spacing;
                this.highlight.segments[this.highlight.segments.length-1].point.x = this.width - this.spacing*0.8;
                this.filterHighlight.segments[this.filterHighlight.segments.length-1].point.x = this.width - this.spacing*0.8;
            }
            // Adjust text 
            this.textLeafOrder.set({point: [this.width-this.spacing*0.80, this.textLeafOrder.point.y]});
            this.textRecto.set({point:[this.textLeafOrder.bounds.right+this.spacing*0.2, this.textRecto.point.y], content: this.recto.texture});
            this.textVerso.set({point:[this.textLeafOrder.bounds.right+this.spacing*0.2, this.textVerso.point.y], content: this.verso.texture});
        } else {
            // Reset leaf 
            if (this.leaf.stub === "None") {
                this.path.segments[this.path.segments.length-1].point.x = this.width;
                this.highlight.segments[this.highlight.segments.length-1].point.x = this.width + 5;
                this.filterHighlight.segments[this.filterHighlight.segments.length-1].point.x = this.width + 5;
            }
            // Reset texts back 
            this.textLeafOrder.set({point: [this.width+10, this.textLeafOrder.point.y]});
            this.textRecto.set({point:[this.width+18, this.textRecto.point.y], content:""});
            this.textVerso.set({point:[this.width+18, this.textVerso.point.y],content:""});
        }
    },
}
// Constructor for leaf
function PaperLeaf(args) {
    this.manager = args.manager;
    this.Notes = args.Notes;
    this.leaf = args.leaf;
    this.recto = args.recto;
    this.verso = args.verso;
    this.order = this.leaf.order;
    this.parentOrder = args.Groups[this.leaf.parentID].order;
    this.conjoined_to = this.leaf.conjoined_leaf_order;
    this.indent = null;
    this.origin = args.origin;
    this.viewingMode = args.viewingMode;
    this.width = this.viewingMode? args.width*0.88 : args.width*0.92;
    this.spacing = args.spacing;
    this.y = args.y;
    this.strokeWidth = args.strokeWidth;
    this.strokeColor = args.strokeColor;
    this.strokeColorActive = args.strokeColorActive;
    this.strokeColorGroupActive = args.strokeColorGroupActive;
    this.strokeColorFilter = args.strokeColorFilter;
    this.strokeColorAdded = args.strokeColorAdded;
    this.highlight = new paper.Path();
    this.filterHighlight = new paper.Path();
    this.path = new paper.Path();
    this.isActive = args.isActive;
    this.handleObjectClick = args.handleObjectClick;
    this.multiplier = args.multiplier;
    this.attachment = new paper.Group();
    this.textNotes = new paper.Group();
    this.openNoteDialog = args.openNoteDialog;

    this.textLeafOrder = new paper.PointText({
        point: [this.width, this.y+5],
        content: "L"+ this.order,
        fillColor: this.strokeColor,
        fontSize: this.spacing*0.48,
    });
    this.textRecto = new paper.PointText({
        point: [this.width+this.spacing, this.y-3],
        fillColor: this.strokeColor,
        fontSize: this.spacing*0.37,
    });
    this.textVerso = new paper.PointText({
        point: [this.width+this.spacing, this.y+this.spacing*0.37-3],
        fillColor: this.strokeColor,
        fontSize: this.spacing*0.37,
    });
    
    this.visibleAttributes = args.visibleAttributes;
    // Set path properties
    if (this.leaf.type==="Added") {
        this.path.strokeColor = args.strokeColorAdded;
    } else if (this.leaf.type==="Endleaf") {
        this.path.strokeColor = "#919191";
    } else {
        this.path.strokeColor = args.strokeColor;
    }
    if (this.leaf.type==='Missing') {
        // If leaf is missing, make stroke dashed
        this.path.dashArray = [20, 10];
    }
    if (this.isActive) {
        this.path.strokeColor = args.strokeColorActive;
    }
    this.path.strokeWidth = this.strokeWidth;
    if (this.leaf.material === "Parchment") {
        this.path.strokeWidth = this.path.strokeWidth*1.20;
    } else if (this.leaf.material === "Paper") {
        this.path.strokeWidth = this.path.strokeWidth*0.80;
    }
}


export default PaperLeaf;
