import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { forkJoin } from 'rxjs';
import { GroupsService } from 'src/app/services/groups/groups.service';
import { Group } from '../../../../../server/client/src/modles/Group';
import { User } from '../../../../../server/client/src/modles/User';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent implements OnInit {

  data = [];

  private svg;
  private margin = 50;
  private width = screen.width / 2 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  groups: Group[] = [];
  users: User[] = [];

  constructor(private groupsService: GroupsService) { }

  private createSvg(): void {
    this.svg = d3.select("figure#pointsPerUserInGroupBar")
      .append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawBars(data: any[]): void {
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map(d => d.UserName))
      .padding(0.2);

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, 50])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.UserName))
      .attr("y", d => y(d.Points))
      .attr("width", x.bandwidth())
      .attr("height", (d) => this.height - y(d.Points))
      .attr("fill", "#9fa8da");
  }

  getGroups(): void {
    forkJoin([this.groupsService.getGroups(), this.groupsService.getUsers()]).subscribe(data => {
      this.groups = data[0];
      this.users = data[1];
    }) 
  }

  handleGroupChange(group: Group) {
    this.data = group.players.map(player => {
      return {
        "UserName": this.users.find(usr => usr._id == player.playerId).displayName,
        "Points": player.points.toString()
      }
    });

    let temp = d3.selectAll("svg");
    temp["_groups"][0][0].remove();
    
    this.createSvg();
    this.drawBars(this.data);
  }

  ngOnInit(): void {
    this.createSvg();
    this.drawBars(this.data);

    this.getGroups();
  }

}