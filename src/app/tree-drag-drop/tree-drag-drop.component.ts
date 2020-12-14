import { Component, OnInit } from '@angular/core';
import { NodeService } from '../node.service';
import { TreeNode } from 'primeng/api';
import { TreeDragDropService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { HelperClass } from './dassDataConversionHelper';
import { microServiceDataHelper } from './microServiceDataConversionHelper';

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
  clonedDaas : TreeNode[];

  constructor(private nodeService: NodeService) {
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


}
