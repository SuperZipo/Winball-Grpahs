import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Group } from '../../../../../server/client/src/modles/Group';
import { User } from '../../../../../server/client/src/modles/User';

@Injectable({
  providedIn: 'root'
})

export class GroupsService {

  private groupsUrl = 'http://localhost:8000/api/groups/';
  private usersUrl = 'http://localhost:8000/api/players/';

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private group = new BehaviorSubject<Group[]>([]);

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.groupsUrl + "/all", this.httpOptions);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl + "/all", this.httpOptions);
  }

  getGroupsCountPerManager(): Observable<any[]> {
    return this.http.get<any[]>(this.groupsUrl + "/groupsCountPerManager");
  }

  constructor(private http: HttpClient) {}
}
