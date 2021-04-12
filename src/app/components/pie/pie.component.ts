import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { thresholdSturges } from 'd3';
import { forkJoin } from 'rxjs';
import { GroupsService } from 'src/app/services/groups/groups.service';
import { User } from '../../../../../server/client/src/modles/User';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.css']
})
export class PieComponent implements OnInit {

  private usersIdsToNames = {};
  private usersIdsToGroupsCount = {};
  private data: any[] = [];
  private svg;
  private margin = 50;
  private width = 750;
  private height = 600;
  // The radius of the pie chart is half the smallest side
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors;

  users: User[] = [];

  private createSvg(): void {
    this.svg = d3.select("figure#groupsCountPerManagerPie")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr(
        "transform",
        "translate(" + this.width / 2 + "," + this.height / 2 + ")"
      );
  }

  private createColors(): void {
    this.colors = d3.scaleOrdinal()
      .domain(this.data.map(d => d.groupsCount.toString()))
      .range(["#c7d3ec", "#a5b8db", "#879cc4", "#677795", "#5a6782"]);
  }

  private drawChart(): void {
    // Compute the position of each group on the pie:
    const pie = d3.pie<any>().value((d: any) => Number(d.groupsCount));

    // Build the pie chart
    this.svg
      .selectAll('pieces')
      .data(pie(this.data))
      .enter()
      .append('path')
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(this.radius)
      )
      .attr('fill', (d, i) => (this.colors(i)))
      .attr("stroke", "#121926")
      .style("stroke-width", "1px");

    // Add labels
    const labelLocation = d3.arc()
      .innerRadius(100)
      .outerRadius(this.radius);

    this.svg
      .selectAll('pieces')
      .data(pie(this.data))
      .enter()
      .append('text')
      .text(d => this.usersIdsToNames[d.data._id] + " - " + this.usersIdsToGroupsCount[d.data._id])
      .attr("transform", d => "translate(" + labelLocation.centroid(d) + ")")
      .style("text-anchor", "middle")
      .style("font-size", 18);
  }

  getGraphData() {
    forkJoin([this.groupsService.getGroupsCountPerManager(), 
      this.groupsService.getUsers()]).subscribe(data => {
      this.data = data[0];
      this.users = data[1];
      
      this.users.forEach(usr => {
        this.usersIdsToNames[usr._id] = usr.displayName
      });

      this.data.forEach(data => {
        this.usersIdsToGroupsCount[data._id] = data.groupsCount 
      })

      this.createSvg();
      this.createColors();
      this.drawChart();
    });
  }

  constructor(private groupsService: GroupsService) { }

  ngOnInit(): void {
    this.getGraphData();
  }

}
