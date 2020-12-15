import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TreeNode } from 'primeng/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NodeService {

  constructor(private http: HttpClient) { }

  getFiles() {
    return this.http.get<any>('assets/sample.json').toPromise()
      .then(res => <TreeNode[]>res.data);
  }

  getLazyFiles() {
    return this.http.get<any>('assets/files-lazy.json')
      .toPromise()
      .then(
        res => <TreeNode[]>res.data
      );
  }

  getFilesUsingObs(): Observable<any> {
    return this.http.get("assets/ds.json");
  }

  getMicroSerJSONUsingObs(): Observable<any> {
    return this.http.get("assets/ms.json");
  }

}
