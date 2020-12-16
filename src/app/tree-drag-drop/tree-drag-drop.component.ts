import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NodeService } from '../node.service';
import { TreeNode } from 'primeng/api';
import { TreeDragDropService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { HelperClass } from './dassDataConversionHelper';
import { microServiceDataHelper } from './microServiceDataConversionHelper';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-tree-drag-drop',
  templateUrl: './tree-drag-drop.component.html',
  styles: [`
  h4 {
      text-align: center;
      margin: 0 0 8px 0;
  }
`],
  providers: [TreeDragDropService, MessageService],
})
export class TreeDragDropComponent implements OnInit {

  daasTreeNode: TreeNode[] = [];
  microServiceTreeNode: TreeNode[] = [];
  helper: HelperClass;
  microHelper: microServiceDataHelper;
  clonedDaas: TreeNode[];
  static latestId: number;
  listenFunc: Function;
  @ViewChild("op") op: OverlayPanel;
  draggedNode: any;

  mappedFieldsList = [];

  constructor(private nodeService: NodeService, private renderer2: Renderer2,
    private elementRef: ElementRef) {
    this.helper = new HelperClass();
    this.microHelper = new microServiceDataHelper();
  }

  ngOnInit(): void {

    /*
    For Daas data conversion
    */
    this.nodeService.getFilesUsingObs().subscribe(data => {
      console.log(data);
      const parentNodeObject = this.helper.createParentNode(data);
      this.daasTreeNode.push(parentNodeObject);
      this.clonedDaas = JSON.parse(JSON.stringify(this.daasTreeNode));
    });

    /*
    For Microservice data conversion
    */
    this.nodeService.getMicroSerJSONUsingObs().subscribe(data => {
      console.log(data);
      const parentNodeObject = this.microHelper.createParentNode(data);
      this.microServiceTreeNode = [...parentNodeObject];
    });

  }


  /*
****************
Logic to expand arguments/responses/all section

*****************

*/

/* #region  Expand section */
  expandAll() {
    this.daasTreeNode = [...this.clonedDaas];
    this.expandArgs("");
  }

  expandResponses() {
    this.daasTreeNode = [...this.clonedDaas];
    this.expandArgs("Arguments");
  }

  expandArguments() {
    this.daasTreeNode = [...this.clonedDaas];
    this.expandArgs("Responses");
  }

  expandArgs(childToRemove) {
    const mainResponseArray = [];
    const responseObj = this.removeFromTree(this.daasTreeNode[0], childToRemove);

    mainResponseArray.push(responseObj);
    mainResponseArray.forEach(node => {
      this.expandRecursive(node, true);
    })

    this.daasTreeNode.length = 0;
    this.daasTreeNode.push(responseObj);
  }

  removeFromTree(parent, childNameToRemove) {
    var _this = this;
    let clonedObject = JSON.parse(JSON.stringify(parent))
    clonedObject.children = parent.children && parent.children
      .filter(function (child) {
        return child.label !== childNameToRemove
      })
      .map(function (child) {
        return _this.removeFromTree(child, childNameToRemove)
      }
      );
    return clonedObject;
  }


  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  /* //#endregion */



/*
****************
Logic for drag and drop - and creation of element to display mapped field

*****************

*/


  onDrop(event) {
    console.log(event);
    // if (false) {
    //   event.accept();
    // } else {
      this.createMappingAfterDragEnd(event);
   // }
  }

  createMappingAfterDragEnd(event) {
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    const element = this.createMappingIcon(event);
    this.populateMappedFieldList(event);
    this.listenFunc = this.renderer2.listen(event.originalEvent.target, 'click', (e) => {
      this.showMappingInformation(e, event);
    });
  }

  static incrementId() {
    if (!this.latestId) this.latestId = 1
    else this.latestId++
    return this.latestId
  }

  createMappingIcon(event) {
    const element = this.renderer2.createElement('div');
    const genratedId = TreeDragDropComponent.incrementId();
    this.renderer2.setAttribute(element, 'id', JSON.stringify(genratedId));
    this.renderer2.setAttribute(element, 'data-val', JSON.stringify(event.dragNode.label));
    element.classList.add('mappedIcon');
    this.renderer2.appendChild(event.originalEvent.target, element);
    return element;
  }

  showMappingInformation(e, parentEvent) {
    e.stopPropagation();
    this.op.toggle(e);

    const draggedLabel = parentEvent.dragNode.label.split(' ')[0];
    this.draggedNode = draggedLabel;
  }

  populateMappedFieldList(event) {
    const mappingFieldsObject = {
      source: event.dragNode.label.split(' ')[0],
      destination: event.dropNode.label.split(' ')[0]
    }

    this.mappedFieldsList.push(mappingFieldsObject);
  }


}
