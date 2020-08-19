import paper from 'paper';
import PaperLeaf from './PaperLeaf.js';
import PaperGroup from './PaperGroup.js';
import { getMemberOrder } from '../../helpers/getMemberOrder';

PaperManager.prototype = {
  constructor: PaperManager,
  createGroup: function (group) {
    let g = new PaperGroup({
      manager: this,
      group: group,
      groupIDs: this.groupIDs,
      y: this.groupYs[this.groupIDs.indexOf(group.id)],
      x: (group.nestLevel - 1) * this.spacing,
      width: this.width,
      groupHeight: this.getGroupHeight(group),
      isActive: this.activeGroups.includes(group.id),
      groupColor: this.groupColor,
      groupColorActive: this.groupColorActive,
      filterColor: this.strokeColorFilter,
      handleObjectClick: this.handleObjectClick,
      textColor: this.groupTextColor,
      visibleAttributes: this.visibleAttributes.group,
      viewingMode: this.viewingMode,
      spacing: this.spacing,
    });

    g.draw();
    g.setMouseEventHandlers();

    // Add this group to collections
    this.groupGroups.addChild(g.filterHighlight);
    this.groupGroups.addChild(g.highlight);
    this.groupGroups.addChild(g.path);
    this.groupGroups.addChild(g.text);
    this.paperGroups.push(g);

    // Add this group to list of items to flash if it's in the flashItems list
    if (this.flashItems.groups.includes(group.id)) {
      this.flashGroups.push(g);
    }
  },
  createLeaf: function (leaf) {
    let l = new PaperLeaf({
      manager: this,
      origin: this.origin,
      width: this.width,
      spacing: this.spacing,
      strokeWidth:
        this.strokeWidth *
        Math.min(1.0, this.multipliers[this.leafIDs.indexOf(leaf.id) + 1]),
      strokeColor: this.strokeColor,
      strokeColorActive: this.strokeColorActive,
      strokeColorGroupActive: this.strokeColorGroupActive,
      strokeColorAdded: this.strokeColorAdded,
      leaf: leaf,
      recto: this.Rectos[leaf.rectoID],
      verso: this.Versos[leaf.versoID],
      groupIDs: this.groupIDs,
      leafIDs: this.leafIDs,
      Groups: this.Groups,
      Notes: this.Notes,
      y: this.leafYs[this.leafIDs.indexOf(leaf.id)],
      isActive:
        this.activeLeafs.includes(leaf.id) ||
        this.activeRectos.includes(leaf.rectoID) ||
        this.activeVersos.includes(leaf.versoID),
      customSpacings: this.customSpacings,
      handleObjectClick: this.handleObjectClick,
      multiplier: this.multipliers[this.leafIDs.indexOf(leaf.id) + 1],
      strokeColorFilter: this.strokeColorFilter,
      visibleAttributes: this.visibleAttributes,
      viewingMode: this.viewingMode,
      openNoteDialog: this.openNoteDialog,
      notationStyle: this.notationStyle,
    });
    this.paperLeaves.push(l);
    this.groupLeaves.addChild(l.path);
    this.groupLeaves.addChild(l.textLeafOrder);
    this.groupLeaves.addChild(l.textRecto);
    this.groupLeaves.addChild(l.textVerso);
    this.groupLeaves.addChild(l.attachment);
    this.groupLeaves.addChild(l.textNotes);
    if (this.flashItems.leaves.includes(leaf.id)) {
      this.flashLeaves.push(l);
    }
    return l;
  },
  draw: function () {
    // Clear existing drawn elements
    this.leafYs = [];
    this.groupYs = [];
    this.paperLeaves = [];
    this.paperGroups = [];
    this.flashGroups = [];
    this.flashLeaves = [];
    this.groupLeaves.removeChildren();
    this.groupGroups.removeChildren();
    this.groupContainer.removeChildren();
    this.groupTacket.removeChildren();

    // Calculate y positions of groups and leaves
    let currentY = 0;
    let prevRootGroupID = null;
    for (let i in this.groupIDs) {
      const groupID = this.groupIDs[i];
      const group = this.Groups[groupID];
      if (group.nestLevel === 1) {
        if (i > 0 && prevRootGroupID) {
          const prevGroupsLastMember = this.getLastMember(prevRootGroupID);
          const nestLevel = prevGroupsLastMember
            ? prevGroupsLastMember.nestLevel + 1
            : 1;
          currentY = currentY + this.spacing * nestLevel;
        }
        this.groupYs.push(currentY);
        currentY = this.calculateYs(group.memberIDs, currentY, this.spacing);

        if (group.memberIDs.length === 0) {
          currentY = currentY + this.spacing;
        }
        prevRootGroupID = groupID;
      }
    }

    // Create background Rectangle for each group
    for (let groupID of this.groupIDs) {
      const group = this.Groups[groupID];
      this.createGroup(group);
    }

    // Create all the leaves
    for (let leafID of this.leafIDs) {
      this.createLeaf(this.Leafs[leafID]);
    }
    // Draw all leaves and set mouse event handlers
    this.paperLeaves.forEach(leaf => {
      leaf.draw();
      leaf.setMouseEventHandlers();
    });

    // Show filter
    this.showFilter();

    // Draw other visualizations
    this.drawTackets();
    this.drawSewing();

    this.groupContainer.addChild(this.groupGroups);
    this.groupContainer.addChild(this.groupLeaves);
    this.groupContainer.addChild(this.groupTacket);
    this.groupContainer.addChild(this.groupTacketGuide);
    // Reposition the drawing
    this.groupContainer.position.y += 10;
    this.fitCanvas();
  },
  activateTacketTool: function (groupID, type = 'tacketed') {
    // Remove existing tacket
    this.groupTacket.removeChildren();
    this.groupTacketGuide.removeChildren();
    this.groupTacketGuideLine.removeChildren();

    this.tacketToolIsActive = true;
    if (this.tool) this.tool.remove();
    this.tool = new paper.Tool();
    this.tool.minDistance = 5;
    let targets = [];

    // Remove hover cursor effect on groups and leaves
    this.paperGroups.forEach(group => group.removeMouseEventHandlers());
    this.paperLeaves.forEach(leaf => leaf.removeMouseEventHandlers());
    document.body.style.cursor = 'crosshair';

    this.drawTacketGuide(groupID, type);

    this.tool.onMouseDown = event => {
      this.tacketLineDrag = new paper.Path();
      this.tacketLineDrag.strokeColor = this.strokeColorTacket;
      this.tacketLineDrag.strokeWidth = 5;
      this.tacketLineDrag.add(event.point);
      this.groupTacketGuide.addChild(this.tacketLineDrag);
    };
    this.tool.onMouseUp = event => {
      // Remove line from canvas
      this.groupTacketGuide.removeChildren();
      // Reset colour of leaves
      this.paperLeaves.forEach(leaf => {
        leaf.deactivate();
      });
      this.toggleVisualizationDrawing({ type: type, value: '' });
      if (targets.length > 0) {
        let targetLeaf1 = targets[0];
        let targetLeaf2 = targets[targets.length / 2];
        this.addVisualization(targetLeaf1.leaf.parentID, type, [
          targetLeaf1.leaf.id,
          targetLeaf2.leaf.id,
        ]);
      } else {
        // Redraw old visualization
        if (type === 'tacketed') {
          this.drawTackets();
        } else {
          this.drawSewing();
        }
      }
    };
    this.tool.onMouseDrag = event => {
      // Update line
      if (!this.tacketLineDrag.segments[1]) {
        this.tacketLineDrag.add(event.point);
      } else {
        this.tacketLineDrag.segments[1].point = event.point;
      }
      targets = [];
      // Highlight leaves that intersect the line
      const targetGroup = this.paperGroups.find(member => {
        return member.group.id === groupID;
      });
      targetGroup.group.memberIDs.forEach(memberID => {
        if (memberID.charAt(0) === 'L') {
          const leaf = this.getLeaf(
            this.leafIDs.indexOf(this.Leafs[memberID].id) + 1
          );
          if (
            leaf.isConjoined() &&
            (this.tacketLineDrag.getIntersections(leaf.path).length > 0 ||
              this.tacketLineDrag.getIntersections(leaf.conjoinedLeaf().path)
                .length > 0)
          ) {
            leaf.path.strokeColor = '#ffffff';
            leaf.conjoinedLeaf().path.strokeColor = '#ffffff';
            // Add leaf to list of targets to tacket
            targets.push(leaf);
          } else {
            leaf.deactivate();
          }
        }
      });
    };
    this.tool.activate();
  },
  drawTacketGuide: function (groupID, type) {
    const targetGroup = this.paperGroups.find(member => {
      return member.group.id === groupID;
    });
    const guideY = targetGroup.path.bounds.height / 2;
    const guideX = targetGroup.path.bounds.left;
    let guideLine = new paper.Path();
    guideLine.strokeColor = '#ffffff';
    guideLine.strokeWidth = 5;
    guideLine.dashArray = [10, 10];
    guideLine.add(
      new paper.Point(
        guideX,
        targetGroup.path.bounds.y + guideY + this.strokeWidth / 2
      )
    );
    guideLine.add(
      new paper.Point(
        guideX + targetGroup.path.bounds.width / 3,
        targetGroup.path.bounds.y + guideY + this.strokeWidth / 2
      )
    );
    let guideLineArrow = new paper.Path();
    guideLineArrow.strokeColor = '#ffffff';
    guideLineArrow.strokeWidth = 3;
    guideLineArrow.add(
      guideLine.segments[1].point.x - 10,
      guideLine.segments[1].point.y - 10
    );
    guideLineArrow.add(
      guideLine.segments[1].point.x,
      guideLine.segments[1].point.y
    );
    guideLineArrow.add(
      guideLine.segments[1].point.x - 10,
      guideLine.segments[1].point.y + 10
    );
    let guideLineX1 = new paper.Path();
    guideLineX1.strokeColor = '#ffffff';
    guideLineX1.strokeWidth = 3;
    guideLineX1.add(
      new paper.Point(guideX - 10, guideLine.segments[0].point.y - 10)
    );
    guideLineX1.add(
      new paper.Point(guideX + 10, guideLine.segments[0].point.y + 10)
    );
    let guideLineX2 = new paper.Path();
    guideLineX2.strokeColor = '#ffffff';
    guideLineX2.strokeWidth = 3;
    guideLineX2.add(
      new paper.Point(guideX - 10, guideLine.segments[0].point.y + 10)
    );
    guideLineX2.add(
      new paper.Point(guideX + 10, guideLine.segments[0].point.y - 10)
    );

    const drawType = type === 'tacketed' ? 'TACKET' : 'SEWING';
    let guideText = new paper.PointText({
      content: 'DRAW ' + drawType + ' LINE',
      point: [guideX + 20, targetGroup.path.bounds.y + guideY - 20],
      fillColor: '#000000',
      fontSize: 12,
    });
    let guideTextRectangle = new paper.Rectangle(
      new paper.Point(guideX + 15, targetGroup.path.bounds.y + guideY - 35),
      new paper.Size(guideText.bounds.width + 10, guideText.bounds.height + 5)
    );
    let guideTextBackground = new paper.Path.Rectangle(guideTextRectangle);
    guideTextBackground.fillColor = 'rgba(255,255,255,0.75)';
    this.groupTacketGuideLine.addChild(guideLine);
    this.groupTacketGuideLine.addChild(guideLineArrow);
    this.tacketToolOriginalPosition = this.groupTacketGuideLine.position.x;
    this.groupTacketGuide.addChild(this.groupTacketGuideLine);
    this.groupTacketGuide.addChild(guideTextBackground);
    this.groupTacketGuide.addChild(guideText);
    this.groupTacketGuide.addChild(guideLineX1);
    this.groupTacketGuide.addChild(guideLineX2);
  },
  deactivateTacketTool: function () {
    this.tacketToolIsActive = false;
    this.groupTacketGuide.removeChildren();
    if (this.tool) {
      this.tool.remove();
    }
    document.body.style.cursor = 'default';
    this.paperGroups.forEach(group => group.setMouseEventHandlers());
    this.paperLeaves.forEach(leaf => leaf.setMouseEventHandlers());
  },
  drawSewing: function () {
    this.paperGroups.forEach(group => {
      if (group.group.sewing !== null && group.group.sewing.length > 0) {
        const leafID1 = group.group.sewing[0];
        const leafID2 =
          group.group.sewing.length > 1 ? group.group.sewing[1] : undefined;

        if (leafID1 !== undefined && this.leafIDs.indexOf(leafID1) >= 0) {
          let startX, startY, endX, endY;
          let paperLeaf1, paperLeaf2;

          paperLeaf1 = this.getLeaf(this.leafIDs.indexOf(leafID1) + 1);
          if (leafID2 !== undefined) {
            paperLeaf2 = this.getLeaf(this.leafIDs.indexOf(leafID2) + 1);
            startX = paperLeaf1.path.segments[0].point.x - this.strokeWidth;
            startY = paperLeaf2.path.segments[0].point.y;
            endX = paperLeaf2.path.segments[0].point.x;
          } else {
            startX = 15;
            startY = paperLeaf1.path.segments[0].point.y;
            endX = paperLeaf1.path.segments[0].point.x;
          }
          if (
            group.group.tacketed !== null &&
            group.group.tacketed.length > 0
          ) {
            startY -= this.spacing * 0.15;
          }
          endY = startY;
          let sewingPath = new paper.Path();
          sewingPath.name = 'tacket1';
          sewingPath.strokeColor = this.strokeColorTacket;
          sewingPath.strokeWidth = 3;
          sewingPath.add(new paper.Point(startX, startY));
          sewingPath.add(new paper.Point(endX + this.strokeWidth, endY));
          const that = this;
          // Add listeners
          sewingPath.onClick = function (event) {
            that.handleObjectClick(group.group, event);
          };
          sewingPath.onMouseEnter = function (event) {
            document.body.style.cursor = 'pointer';
          };
          sewingPath.onMouseLeave = function (event) {
            document.body.style.cursor = 'default';
          };
          this.groupTacket.addChild(sewingPath);
        }
      }
    });
  },
  drawTackets: function () {
    this.paperGroups.forEach(group => {
      if (group.group.tacketed !== null && group.group.tacketed.length > 0) {
        const leafID1 = group.group.tacketed[0];
        const leafID2 = group.group.tacketed[1];
        if (leafID1 !== undefined && this.leafIDs.indexOf(leafID1) >= 0) {
          let startX, startY, endX, endY;
          let paperLeaf1, paperLeaf2;

          paperLeaf1 = this.getLeaf(this.leafIDs.indexOf(leafID1) + 1);
          if (leafID2 !== undefined) {
            paperLeaf2 = this.getLeaf(this.leafIDs.indexOf(leafID2) + 1);
            startX = paperLeaf1.path.segments[0].point.x - this.strokeWidth;
            startY = paperLeaf2.path.segments[0].point.y;
            endX = paperLeaf2.path.segments[0].point.x;
          } else {
            startX = 15;
            startY = paperLeaf1.path.segments[0].point.y;
            endX = paperLeaf1.path.segments[0].point.x;
          }
          if (
            group.group.tacketed !== null &&
            group.group.tacketed.length > 0
          ) {
            startY -= this.spacing * 0.2;
          }
          if (group.group.sewing !== null && group.group.sewing.length > 0) {
            startY += this.spacing * 0.25;
          }
          endY = startY;
          let tacketPath1 = new paper.Path();
          tacketPath1.name = 'tacket1';
          tacketPath1.strokeColor = this.strokeColorTacket;
          tacketPath1.strokeWidth = 3;
          tacketPath1.add(new paper.Point(startX, startY - 2));
          tacketPath1.add(new paper.Point(endX + this.strokeWidth, endY - 2));
          tacketPath1.add(
            new paper.Point(
              tacketPath1.segments[1].point.x + 5,
              tacketPath1.segments[1].point.y - 3
            )
          );
          let tacketPath2 = new paper.Path();
          tacketPath2.name = 'tacket2';
          tacketPath2.strokeColor = this.strokeColorTacket;
          tacketPath2.strokeWidth = 3;
          tacketPath2.add(new paper.Point(startX, startY + 2));
          tacketPath2.add(new paper.Point(endX + this.strokeWidth, endY + 2));
          tacketPath2.add(
            new paper.Point(
              tacketPath2.segments[1].point.x + 5,
              tacketPath2.segments[1].point.y + 3
            )
          );
          const that = this;
          // Add listeners
          tacketPath1.onClick = function (event) {
            that.handleObjectClick(group.group, event);
          };
          tacketPath2.onClick = function (event) {
            that.handleObjectClick(group.group, event);
          };
          tacketPath1.onMouseEnter = function (event) {
            document.body.style.cursor = 'pointer';
          };
          tacketPath1.onMouseLeave = function (event) {
            document.body.style.cursor = 'default';
          };
          tacketPath2.onMouseEnter = function (event) {
            document.body.style.cursor = 'pointer';
          };
          tacketPath2.onMouseLeave = function (event) {
            document.body.style.cursor = 'default';
          };
          this.groupTacket.addChild(tacketPath1);
          this.groupTacket.addChild(tacketPath2);
        }
      }
    });
  },
  getYOfFirstMember: function (groupID) {
    let group = this.Groups[groupID];
    if (group.memberIDs.length === 0) {
      let y = this.groupYs[this.groupIDs.indexOf(group.id)];
      return y;
    }
    let firstMemberID = group.memberIDs[0];
    let firstMember = this[firstMemberID.split('_')[0] + 's'][firstMemberID];
    if (firstMemberID.memberType === 'Group') {
      return this.getYOfFirstMember(firstMemberID);
    } else {
      let firstLeafY = this.leafYs[this.leafIDs.indexOf(firstMember.id)];
      return firstLeafY;
    }
  },
  getYOfLastMember: function (groupID) {
    const group = this.Groups[groupID];
    const lastMember = this.getLastMember(groupID);
    if (lastMember && lastMember.memberType === 'Group') {
      let y = this.groupYs[this.groupIDs.indexOf(lastMember.id)];
      return y + (lastMember.nestLevel - group.nestLevel) * this.spacing;
    } else if (lastMember && lastMember.memberType === 'Leaf') {
      let lastLeafY =
        this.leafYs[this.leafIDs.indexOf(lastMember.id)] +
        this.strokeWidth +
        this.spacing / 2.0;
      return (
        lastLeafY + (lastMember.nestLevel - group.nestLevel - 1) * this.spacing
      );
    } else {
      return 0;
    }
  },
  getLastMember: function (groupID) {
    let lastMemberIDs = this.Groups[groupID].memberIDs;
    if (lastMemberIDs.length === 0) return null;
    let lastMemberID = lastMemberIDs[lastMemberIDs.length - 1];
    if (lastMemberID.charAt(0) === 'L') {
      return this.Leafs[lastMemberID];
    } else {
      let lastMember = this.Groups[lastMemberID];
      // Check if this group has members
      let innerLastMember = this.getLastMember(lastMemberID);
      if (innerLastMember) lastMember = innerLastMember;
      return lastMember;
    }
  },
  getGroupHeight: function (group) {
    if (group.memberIDs.length > 0) {
      let height =
        this.getYOfLastMember(group.id) -
        this.groupYs[this.groupIDs.indexOf(group.id)];
      return height + this.spacing;
    } else {
      return this.spacing;
    }
  },
  numLeaves: function () {
    return this.paperLeaves.length;
  },
  getLeaf: function (leaf_order) {
    return this.paperLeaves[leaf_order - 1];
  },
  getLastLeaf: function () {
    return this.paperLeaves[this.numLeaves() - 1];
  },
  calculateYs: function (members, currentY, spacing) {
    if (members.length < 1) {
      return currentY;
    }
    let multiplier = 1;
    if (members.length > 70) {
      multiplier = 0.5;
    } else if (members.length > 45) {
      multiplier = 0.6;
    } else if (members.length > 35 || this.viewingMode) {
      multiplier = 0.8;
    }
    members.forEach((memberID, i) => {
      let memberObject = this[memberID.split('_')[0] + 's'][memberID];
      let notesToShowAbove = memberObject.notes.filter(noteID => {
        return this.Notes[noteID].show;
      }).length;
      let notesToShowBelow = 0;
      let glueSpacing = 0;
      if (memberObject.memberType === 'Leaf') {
        // Find if it has side notes
        notesToShowAbove += this.Rectos[memberObject.rectoID].notes.filter(
          noteID => {
            return this.Notes[noteID].show;
          }
        ).length;
        notesToShowBelow += this.Versos[memberObject.versoID].notes.filter(
          noteID => {
            return this.Notes[noteID].show;
          }
        ).length;
        // Find if leaf has glue that's not a partial glue
        glueSpacing =
          notesToShowAbove > 0 &&
          memberObject.attached_above.includes('Glued') &&
          !memberObject.attached_above.includes('Partial')
            ? 1
            : 0;
      }

      if (
        memberObject.memberType === 'Leaf' &&
        getMemberOrder(memberObject, this.Groups, this.groupIDs) === 1 &&
        notesToShowAbove > 0
      ) {
        // First leaf in the group with a note
        this.multipliers[
          this.leafIDs.indexOf(memberObject.id) + 1
        ] = multiplier;
        currentY = currentY + spacing * (notesToShowAbove + 1);
        this.leafYs.push(currentY);
        currentY = currentY + spacing * notesToShowBelow * 0.8;
        if (i === members.length - 1) {
          // Last member of group
          currentY = currentY + memberObject.nestLevel * spacing;
        }
      } else if (
        memberObject.memberType === 'Leaf' &&
        this.leafIDs.indexOf(memberObject.id) + 1 > 0
      ) {
        this.multipliers[
          this.leafIDs.indexOf(memberObject.id) + 1
        ] = multiplier;
        currentY =
          currentY +
          spacing * Math.max(1, notesToShowAbove) +
          spacing * glueSpacing;
        if (
          i > 0 &&
          members[i - 1].includes('Group') &&
          this.Groups[members[i - 1]].memberIDs.length
        ) {
          // Previous sibling is a group with children
          // Find difference of nest level between current leaf and previous group's last member
          const previousMember = this.getLastMember(members[i - 1]);
          currentY =
            currentY +
            (previousMember.nestLevel - memberObject.nestLevel) * spacing;
        }
        this.leafYs.push(currentY);
        currentY = currentY + spacing * notesToShowBelow * 0.8;
      } else if (memberObject.memberType === 'Group') {
        currentY = currentY + spacing;
        if (
          i > 0 &&
          members[i - 1].includes('Group') &&
          this.Groups[members[i - 1]].memberIDs.length > 0
        ) {
          // Previous sibling is a group with children
          const previousMember = this.getLastMember(members[i - 1]);
          currentY =
            currentY +
            (previousMember.nestLevel - memberObject.nestLevel + 1) * spacing;
        } else if (
          i > 0 &&
          members[i - 1].includes('Group') &&
          this.Groups[members[i - 1]].memberIDs.length === 0
        ) {
          // Previous sibling is a group without children
          currentY = currentY + spacing;
        }
        this.groupYs.push(currentY);

        // Recursify!!!
        currentY = this.calculateYs(memberObject.memberIDs, currentY, spacing);
      }
    });
    return currentY;
  },
  fitCanvas: function () {
    // Resize canvas so that nothing is cut off
    this.canvas.height = this.groupGroups.bounds.bottom + 10;
  },
  setWidth: function (value) {
    this.width = value;
  },
  setProject: function (project) {
    this.groupIDs = project.groupIDs;
    this.leafIDs = project.leafIDs;
    this.Groups = project.Groups;
    this.Leafs = project.Leafs;
    this.Rectos = project.Rectos;
    this.Versos = project.Versos;
    this.Notes = project.Notes;
  },
  setActiveGroups: function (value) {
    this.activeGroups = value;
    if (this.paperGroups.length > 0) {
      this.paperGroups.forEach(group => {
        group.deactivate();
      });
      this.paperGroups.forEach(paperGroup => {
        if (this.activeGroups.includes(paperGroup.group.id)) {
          paperGroup.activate();
        }
      });
    }
  },
  setActiveLeafs: function (value) {
    this.activeLeafs = value;
    if (this.paperLeaves.length > 0) {
      this.paperLeaves.forEach(leaf => {
        leaf.deactivate();
      });
      this.paperLeaves.forEach(paperLeaf => {
        if (this.activeLeafs.includes(paperLeaf.leaf.id)) {
          paperLeaf.activate();
        }
      });
    }
  },
  setActiveRectos: function (value) {
    this.activeRectos = value;
    if (this.paperLeaves.length > 0) {
      this.paperLeaves.forEach(leaf => {
        leaf.deactivate();
      });
      this.paperLeaves.forEach(paperLeaf => {
        if (this.activeRectos.includes(paperLeaf.leaf.rectoID)) {
          paperLeaf.activate();
        }
      });
    }
  },
  setActiveVersos: function (value) {
    this.activeVersos = value;
    if (this.paperLeaves.length > 0) {
      this.paperLeaves.forEach(leaf => {
        leaf.deactivate();
      });
      this.paperLeaves.forEach(paperLeaf => {
        if (this.activeVersos.includes(paperLeaf.leaf.versoID)) {
          paperLeaf.activate();
        }
      });
    }
  },
  setFlashItems: function (value) {
    this.flashItems = value;
  },
  setFilter: function (filters) {
    this.filters = filters;
    this.showFilter();
  },
  showFilter: function () {
    this.paperLeaves.forEach(leaf => {
      leaf.filterHighlight.opacity = 0;
      if (
        this.filters.Leafs.includes(leaf.leaf.id) ||
        this.filters.Sides.includes(leaf.leaf.rectoID) ||
        this.filters.Sides.includes(leaf.leaf.versoID)
      ) {
        leaf.filterHighlight.opacity = 1;
      }
    });
    this.paperGroups.forEach(group => {
      group.filterHighlight.opacity = 0;
      if (this.filters.Groups.includes(group.group.id)) {
        group.filterHighlight.opacity = 1;
      }
    });
  },
  setVisibility: function (visibleAttributes) {
    this.visibleAttributes = visibleAttributes;
    this.paperGroups.forEach(group =>
      group.setVisibility(visibleAttributes.group)
    );
    this.paperLeaves.forEach(leaf => leaf.setVisibility(visibleAttributes));
  },
  setScale: function (spacing, strokeWidth) {
    this.spacing = this.width * spacing;
    this.strokeWidth = this.width * strokeWidth;
  },
};
function PaperManager(args) {
  this.canvas = document.getElementById(args.canvasID);
  paper.setup(this.canvas);
  this.tool = null;
  this.groupIDs = args.groupIDs;
  this.leafIDs = args.leafIDs;
  this.Groups = args.Groups;
  this.Leafs = args.Leafs;
  this.Rectos = args.Rectos;
  this.Versos = args.Versos;
  this.Notes = args.Notes;
  this.origin = args.origin;
  this.width = paper.view.viewSize.width;
  this.spacing = this.width * args.spacing;
  this.strokeWidth = this.width * args.strokeWidth;
  this.strokeColor = args.strokeColor;
  this.strokeColorActive = args.strokeColorActive;
  this.strokeColorAdded = args.strokeColorAdded;
  this.strokeColorGroupActive = args.strokeColorGroupActive;
  this.strokeColorTacket = args.strokeColorTacket;
  this.groupColor = args.groupColor;
  this.groupColorActive = args.groupColorActive;
  this.groupTextColor = args.groupTextColor;
  this.handleObjectClick = args.handleObjectClick;
  this.groupLeaves = new paper.Group(); // Groups of leaf paths
  this.groupGroups = new paper.Group(); // Group of group paths
  this.groupContainer = new paper.Group();
  this.activeGroups = args.activeGroups;
  this.activeLeafs = args.activeLeafs;
  this.activeRectos = args.activeRectos;
  this.activeVersos = args.activeVersos;
  this.paperLeaves = [];
  this.paperGroups = [];
  this.leafYs = [];
  this.groupYs = [];
  this.multipliers = {};
  this.flashItems = args.flashItems;
  this.flashLeaves = [];
  this.flashGroups = [];
  this.filters = args.filters;
  this.strokeColorFilter = args.strokeColorFilter;
  this.visibleAttributes = args.visibleAttributes;
  this.viewingMode = args.viewingMode;
  this.tacketLineDrag = new paper.Path();
  this.groupTacketGuide = new paper.Group();
  this.groupTacketGuideLine = new paper.Group();
  this.groupTacket = new paper.Group();
  this.toggleVisualizationDrawing = args.toggleVisualizationDrawing;
  this.addVisualization = args.addVisualization;
  this.tacketToolIsActive = false;
  this.tacketToolOriginalPosition = 0;
  this.slideForward = true;
  this.openNoteDialog = args.openNoteDialog;
  this.leafIDs = args.leafIDs;
  this.notationStyle = args.notationStyle;

  let that = this;
  // Flash newly added items
  paper.view.onFrame = function (event) {
    for (let i = 0; i < that.flashLeaves.length; i++) {
      that.flashLeaves[i].highlight.opacity = Math.min(
        0.8,
        that.flashLeaves[i].highlight.opacity + 0.05
      );
    }
    for (let i = 0; i < that.flashGroups.length; i++) {
      that.flashGroups[i].highlight.opacity = Math.min(
        0.8,
        that.flashGroups[i].highlight.opacity + 0.05
      );
    }
    if (that.tacketToolIsActive) {
      if (that.slideForward) {
        that.groupTacketGuideLine.position.x += 0.5;
        if (
          that.groupTacketGuideLine.position.x >
          that.tacketToolOriginalPosition + 25
        ) {
          that.slideForward = false;
        }
      } else {
        that.groupTacketGuideLine.position.x -= 0.5;
        if (
          that.groupTacketGuideLine.position.x < that.tacketToolOriginalPosition
        ) {
          that.slideForward = true;
        }
      }
    }
  };
}
export default PaperManager;
