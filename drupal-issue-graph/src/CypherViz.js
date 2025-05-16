import React from 'react';
import './App.css';
import ForceGraph2D from 'react-force-graph-2d';
import SearchBar from './component/SearchBar';
import IssueList from './component/IssueList';
import IssueDetails from './component/IssueDetails';
import StatusSummary from './component/StatusSummary';
import OrphanStatusModal from './component/OrphanStatusModal';
import ComponentStatusModal from './component/ComponentStatusModal';
import MostReferencedModal from './component/MostReferencedModal';
import MetaIssuesModal from './component/MetaIssuesModal';
import {
  LINK_COLOURS,
  ISSUE_STATUS_COLORS,
  ISSUE_STATUS_COLORS_RAW,
  ISSUE_STATUSES, CLOSED_OPACITY, HIDDEN_OPACITY, LINK_OPACITY, PROJECTS,
} from './util/constants';
import RootNodeInput from './component/RootNodeInput';
import MaxDistanceInput from './component/MaxDistanceInput';
import CurrentRootNode from './component/CurrentRootNode';

// Usage: <CypherViz driver={driver}/>

class CypherViz extends React.Component {
  constructor({ driver }) {
    super();
    this.driver = driver;
    this.graphContainerRef = React.createRef(); // Create ref for container
    this.statsDropdownRef = React.createRef(); // Create ref for stats dropdown

    this.allNodes = {};
    this.allLinks = {};

    this.hideClosed = true;

    const openIssueStatus = Object.keys(ISSUE_STATUSES).filter(status => {
      return this.isStatusClosed(status) === false;
    });

    this.state = {
      topBarLoading: true,
      loaderMessage: 'Loading...',

      graphWidth: 0,
      graphHeight: 0,

      searchTerm: '',
      searchResults: [],

      highlightNodes: new Set(),
      highlightLinks: new Set(),
      hoverNode: null,

      issueHistory: [],
      selectedNode: null,
      nodeDetails: null,
      isLoading: false,
      rootNodeId: "2869792",
      projectId: "3060",
      maxDistance: 2,
      hoveredStatus: null,
      orphanStatusCounts: [],
      totalStatusCounts: {},
      componentCounts: [],
      showOrphanCountsModal: false,
      showComponentCountsModal: false,
      referencedIssues: [],
      showReferencedIssuesModal: false,
      metaIssues: [],
      showMetaIssuesModal: false,
      data: {
        nodes: [],
        links: []
      },
      searchNodes: `
        CALL db.index.fulltext.queryNodes("node_titles", "{{search}}~") YIELD node, score 
        WHERE node.field_issue_status IN ['${openIssueStatus.join('\' , \'')}']
        RETURN node, score LIMIT 100
      `,
      allOrphanNodes: `
        MATCH (n)
        WHERE NOT (n)--()
        RETURN n, 0 as distance;
      `,
      orphanNodeStatusCounts: `
        MATCH (n:Issue)
        WHERE NOT (n)--()
        RETURN n.field_issue_status as status, count(n) as count
        ORDER BY count DESC
      `,
      totalNodeStatusCounts: `
        MATCH (n:Issue)
        RETURN n.field_issue_status as status, count(n) as count
      `,
      componentIssuesCounts: `
        MATCH (n:Issue {field_project: "3060"})
        WITH n.field_issue_component AS component,
             count(n) AS count,
             count(CASE WHEN NOT n.field_issue_status IN ['2', '3', '5', '6', '7', '17', '18'] THEN 1 END) AS openCount
        RETURN component, count, openCount
        ORDER BY count DESC
      `,
      allNodes: `
        MATCH (n:Issue)
        OPTIONAL MATCH path = shortestPath((n)-[*1..{{maxDistance}}]->(m:Issue {nid: "{{rootNodeId}}" }))
        WHERE n <> m
        WITH n, CASE WHEN path IS NOT NULL THEN length(path) ELSE -1 END AS distance
        WHERE (distance <= {{maxDistance}} AND distance >= 0) OR n.nid = "{{rootNodeId}}"
        RETURN n, distance
        ORDER BY distance ASC
      `,
      allNodeForProject: `
        MATCH (n:Issue {field_project: "{{projectId}}"})
        RETURN n, 0 as distance;
      `,
      allLinksForProject: `
        MATCH (n:Issue {field_project: "{{projectId}}"})
        WITH COLLECT(n.nid) AS nodeIds
        MATCH (source:Issue)-[r:RELATED|PARENT|MENTIONED|CHILD]->(target:Issue)
        WHERE source.nid IN nodeIds AND target.nid IN nodeIds
        RETURN source.nid as source, target.nid as target, type(r) as name,
          source.field_issue_status as source_status, target.field_issue_status as target_status
      `,
      allProjectComponents: `
        MATCH (n:Issue) 
        RETURN DISTINCT n.field_project, n.field_issue_component 
        ORDER BY n.field_project, n.field_issue_component ASC
      `,
      allForProjectComponent: `
        MATCH (n:Issue {field_project: "{{project}}", field_issue_component: "{{component}}"})
        
        // Find related issues within {{maxDistance}} steps
        OPTIONAL MATCH path = (start)-[*1..{{maxDistance}}]-(connected:Issue)
        WHERE start <> connected
        
        // Return both sets with distances
        RETURN DISTINCT start AS n, 0 AS distance
        UNION
        
        MATCH (start:Issue {field_project: "{{project}}", field_issue_component: "{{component}}"})
        MATCH path = (start)-[*1..{{maxDistance}}]-(connected:Issue)
        WHERE start <> connected
        RETURN DISTINCT connected AS n, length(path) AS distance
        ORDER BY distance ASC`,
      allNodesNoFilter: `
        MATCH (n:Issue)
        RETURN n, 0 as distance
      `,
      allLinks: `
        MATCH (n:Issue)
        OPTIONAL MATCH path = shortestPath((n)-[*1..{{maxDistance}}]->(m:Issue {nid: "{{rootNodeId}}"}))
        WHERE n <> m
        WITH n, CASE WHEN path IS NOT NULL THEN length(path) ELSE -1 END AS distance
        WHERE (distance <= {{maxDistance}} AND distance >= 0) OR n.nid = "{{rootNodeId}}"
        WITH COLLECT(n.nid) AS nodeIds
        MATCH (source:Issue)-[r:RELATED|PARENT|MENTIONED|CHILD]->(target:Issue)
        WHERE source.nid IN nodeIds AND target.nid IN nodeIds
        RETURN source.nid as source, target.nid as target, type(r) as name,
          source.field_issue_status as source_status, target.field_issue_status as target_status
      `,
      allLinksx: `
        MATCH (n)-[r]->(m)  
        WHERE type(r) IN [
          'RELATED', 
          'PARENT',
          'MENTIONED', 
          'CHILD'
        ]
        RETURN n.nid as source, m.nid as target, type(r) as name, n.field_issue_status as source_status, m.field_issue_status as target_status
      `,
      mostReferencedQuery: `
        MATCH (n:Issue)<-[r]-(m:Issue)
        WITH n, type(r) as relType, count(r) as relCount
        WITH n, relType, relCount
        ORDER BY relCount DESC
        WITH n.nid as nid, n.title as title, collect({relType: relType, count: relCount}) as relations
        WITH nid, title, relations, 
             reduce(total = 0, rel IN relations | total + rel.count) as totalCount
        RETURN nid, title, relations, totalCount
        ORDER BY totalCount DESC
        LIMIT 500
      `,
      metaIssuesQuery: `
        MATCH (n:Issue)
        WHERE n.title =~ "(?i).*\\[meta\\].*"
        RETURN n
        ORDER BY n.changed DESC
        LIMIT 500
      `,
    }
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handlePopState);

    // Set up resize observer
    this.resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        this.setState({
          graphWidth: width,
          graphHeight: height
        });
      }
    });

    // Start observing container
    if (this.graphContainerRef.current) {
      this.resizeObserver.observe(this.graphContainerRef.current);
    }

    this.loadIssueData();
  }

  componentWillUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    window.removeEventListener('popstate', this.handlePopState);
  }

  showTopBarLoader = (message = 'Loading...') => {
    this.setState({
      topBarLoading: true,
      loaderMessage: message
    });
  }

  hideTopBarLoader = () => {
    this.setState({
      topBarLoading: false,
      loaderMessage: ''
    });
  }

  doSearch = async (search) => {
    if (!search || search.length < 2) return [];

    let session = this.driver.session({ database: "neo4j" });
    let query = this.state.searchNodes.replaceAll("{{search}}", search);

    try {
      const result = await session.run(query);
      const nodes = result.records.map(r => {
        const node = r.get('node');
        node.properties = this.processNodeProperties(node.properties);
        node.properties.score = r.get('score');
        return node.properties;
      });
      return nodes;
    } catch (error) {
      console.error("Search error:", error);
      return [];
    } finally {
      session.close();
    }
  }

  handleSearchChange = async (event) => {
    const searchTerm = event.target.value;
    this.setState({ searchTerm });

    if (searchTerm.length >= 2) {
      const results = await this.doSearch(searchTerm);
      this.setState({ searchResults: results });
    } else {
      this.setState({ searchResults: [] });
    }
  }

  selectSearchResult = (nid) => {
    this.setState({
      rootNodeId: nid,
      searchTerm: '',
      searchResults: []
    }, () => {
      this.loadIssueData();
    });
  }

  closeSearchResults = () => {
    this.setState({
      searchTerm: '',
      searchResults: []
    });
  }

  handleNodeHover = (node) => {
    const highlightNodes = new Set();
    const highlightLinks = new Set();

    if (node) {
      highlightNodes.add(node);
      if (node.neighbours) {
        this.state.data.nodes.forEach(n => {
          if (node.neighbours.includes(n.nid)) {
            highlightNodes.add(n);
          }
        });
      }
      if (node.links) {
        node.links.forEach(link => highlightLinks.add(link));
      }
    } else if (this.state.hoveredStatus) {
      // If no node is hovered but a status is hovered, maintain status highlighting
      this.highlightNodesByStatus(highlightNodes, highlightLinks);
    }

    this.setState({
      highlightNodes,
      highlightLinks,
      hoverNode: node || null
    });
  }

  handleStatusHover = (status) => {
    this.setState({ hoveredStatus: status }, () => {
      if (!this.state.hoverNode) {
        // Only update highlights if no node is currently being hovered
        const highlightNodes = new Set();
        const highlightLinks = new Set();

        if (status) {
          this.highlightNodesByStatus(highlightNodes, highlightLinks);
        }

        this.setState({
          highlightNodes,
          highlightLinks
        });
      }
    });
  }

  handleLinkHover = async (link) => {
    const highlightNodes = new Set();
    const highlightLinks = new Set();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    this.setState({
      highlightNodes,
      highlightLinks
    });
  }

  highlightNodesByStatus = (highlightNodes, highlightLinks) => {
    // Add all nodes with the hovered status to the highlight set
    this.state.data.nodes.forEach(node => {
      if (node.field_issue_status === this.state.hoveredStatus) {
        highlightNodes.add(node);

        // Also highlight links connected to these nodes
        if (node.links) {
          node.links.forEach(link => {
            // Only highlight links where both nodes have the status
            const sourceNode = typeof link.source === 'object' ? link.source :
              this.state.data.nodes.find(n => n.nid === link.source);
            const targetNode = typeof link.target === 'object' ? link.target :
              this.state.data.nodes.find(n => n.nid === link.target);

            if (sourceNode && targetNode) {
              if (sourceNode.field_issue_status === this.state.hoveredStatus ||
                  targetNode.field_issue_status === this.state.hoveredStatus) {
                highlightLinks.add(link);
              }
            }
          });
        }
      }
    });
  }

  paintRing = (node, ctx) => {
    // console.group('Painting Ring');
    // console.log(node);
    // console.log(ctx);
    // add ring just for highlighted nodes
    const NODE_R = Math.cbrt(node.targetted) * 5; // Define appropriate node radius constant
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_R, 0, 2 * Math.PI, false);
    const opacity = this.isStatusClosed(node.field_issue_status) ?
      parseInt(CLOSED_OPACITY, 16)/255 : 1;
    const color = node === this.state.hoverNode ? 'green' : 'orange';
    ctx.fillStyle = `rgba(${color === 'green' ? '0,128,0' : '255,165,0'},${opacity})`;
    ctx.fill();
    // console.groupEnd();
  }

  handlePopState = (event) => {
    // Get the issue ID from browser history state
    const issueId = event.state?.issueId;

    if (issueId) {
      // Load the issue without pushing to history again
      this.loadIssueByIdWithoutHistoryUpdate(issueId);
    } else if (this.state.selectedNode) {
      // No state means we're going back to the main view
      this.closePopup();
    }
  }

  handleChange = (event) => {
    this.setState({query:event.target.value})
  }

  updateRootNodeOnChange = (event) => {
    this.updateRootNode(event.target.value);
  }
  updateRootNode = (nid) => {
    this.closePopup();
    this.setState({rootNodeId: nid})
    this.loadIssueData();
  }
  updateDistance = (event) => {
    this.setState({maxDistance: event.target.value})
    this.loadIssueData();
  }

  loadOrphanIssueData = async () => {
    this.showTopBarLoader('Loading orphan issue data...');

    let session = await this.driver.session({ database: "neo4j" });

    let nodeQuery = this.state.allOrphanNodes;
    this.allNodes = await session.run(nodeQuery);
    session.close();

    let allNodes = {...this.allNodes};

    let nodes = allNodes.records.map(r => {
      let node = r.get('n');
      return this.processNodeProperties(node.properties);
    });

    this.setState({ data : {nodes, links: []}});

    this.hideTopBarLoader();
  }

  loadOrphanStatusCounts = async () => {
    this.showTopBarLoader('Loading orphan status counts...');

    let session = await this.driver.session({ database: "neo4j" });

    try {
      // Get orphan counts
      const orphanResult = await session.run(this.state.orphanNodeStatusCounts);
      const orphanCounts = orphanResult.records.map(record => ({
        status: record.get('status'),
        count: record.get('count').toNumber()
      }));

      // Get total counts
      const totalResult = await session.run(this.state.totalNodeStatusCounts);
      const totalCounts = {};
      totalResult.records.forEach(record => {
        const status = record.get('status');
        const count = record.get('count').toNumber();
        totalCounts[status] = count;
      });

      this.setState({
        orphanStatusCounts: orphanCounts,
        totalStatusCounts: totalCounts,
        showOrphanCountsModal: true
      });
    } catch (error) {
      console.error("Error loading status counts:", error);
    } finally {
      session.close();
      this.hideTopBarLoader();
    }
  }

  closeOrphanCountsModal = () => {
    this.setState({ showOrphanCountsModal: false });
    // Reset dropdown selection
    if (this.statsDropdownRef.current) {
      this.statsDropdownRef.current.value = "";
    }
  }

  loadComponentCounts = async () => {
    this.showTopBarLoader('Loading component statistics...');

    let session = await this.driver.session({ database: "neo4j" });

    try {
      const result = await session.run(this.state.componentIssuesCounts);

      const counts = result.records.map(record => ({
        component: record.get('component'),
        count: record.get('count').toNumber(),
        openCount: record.get('openCount').toNumber()
      }));

      this.setState({
        componentCounts: counts,
        showComponentCountsModal: true
      });
    } catch (error) {
      console.error("Error loading component counts:", error);
    } finally {
      session.close();
      this.hideTopBarLoader();
    }
  }

  closeComponentCountsModal = () => {
    this.setState({ showComponentCountsModal: false });
    // Reset dropdown selection
    if (this.statsDropdownRef.current) {
      this.statsDropdownRef.current.value = "";
    }
  }

  loadMostReferencedIssues = async () => {
    this.showTopBarLoader('Loading most referenced issues...');

    let session = await this.driver.session({ database: "neo4j" });

    try {
      const result = await session.run(this.state.mostReferencedQuery);

      const issues = result.records.map(record => {
        const nid = record.get('nid');
        const title = record.get('title');
        const relations = record.get('relations');
        const total = record.get('totalCount').toNumber();

        // Create an object for the issue with relation counts
        const issue = { nid, title, total };

        // Add counts for specific relation types
        relations.forEach(rel => {
          issue[rel.relType] = rel.count.toNumber();
        });

        return issue;
      });

      this.setState({
        referencedIssues: issues,
        showReferencedIssuesModal: true
      });
    } catch (error) {
      console.error("Error loading most referenced issues:", error);
    } finally {
      session.close();
      this.hideTopBarLoader();
    }
  }

  closeReferencedIssuesModal = () => {
    this.setState({ showReferencedIssuesModal: false });
    // Reset dropdown selection
    if (this.statsDropdownRef.current) {
      this.statsDropdownRef.current.value = "";
    }
  }

  loadMetaIssues = async () => {
    this.showTopBarLoader('Loading meta issues...');

    let session = await this.driver.session({ database: "neo4j" });

    try {
      const result = await session.run(this.state.metaIssuesQuery);

      const issues = result.records.map(record => {
        const node = record.get('n');
        return this.processNodeProperties(node.properties);
      });

      this.setState({
        metaIssues: issues,
        showMetaIssuesModal: true
      });
    } catch (error) {
      console.error("Error loading meta issues:", error);
    } finally {
      session.close();
      this.hideTopBarLoader();
    }
  }

  closeMetaIssuesModal = () => {
    this.setState({ showMetaIssuesModal: false });
    // Reset dropdown selection
    if (this.statsDropdownRef.current) {
      this.statsDropdownRef.current.value = "";
    }
  }

  handleOrphanOptionChange = (event) => {
    const option = event.target.value;

    switch(option) {
      case 'load':
        this.loadOrphanIssueData();
        break;
      case 'stats':
        this.loadOrphanStatusCounts();
        break;
      case 'components':
        this.loadComponentCounts();
        break;
      case 'referenced':
        this.loadMostReferencedIssues();
        break;
      case 'meta':
        this.loadMetaIssues();
        break;
      default:
        break;
    }
  }

  loadProjectIssueData = async () => {
    this.showTopBarLoader('Loading issue data for single project...');

    let session = await this.driver.session({ database: "neo4j" });


    let nodeQuery = this.state.allNodeForProject.replaceAll("{{projectId}}", this.state.projectId);
    // let nodeQuery = this.state.allNodesNoFilter;
    this.allNodes = await session.run(nodeQuery);
    this.allLinks = await session.run(this.state.allLinksForProject.replaceAll("{{projectId}}", this.state.projectId));

    session.close();

    this.loadIssueData(false);

    this.hideTopBarLoader();
  }

  handleProjectChange = (event) => {
    this.setState({ projectId: event.target.value }, () => {
      this.loadProjectIssueData();
    });
  }

  loadIssueData = async (loadNewData = true) => {
    if (loadNewData) {
      this.showTopBarLoader('Loading issue data...');

      let session = await this.driver.session({ database: "neo4j" });

      let nodeQuery = this.state.allNodes.replaceAll("{{rootNodeId}}", this.state.rootNodeId).replaceAll("{{maxDistance}}", this.state.maxDistance);
      this.allNodes = await session.run(nodeQuery);

      this.allLinks = await session.run(this.state.allLinks.replaceAll("{{rootNodeId}}", this.state.rootNodeId).replaceAll("{{maxDistance}}", this.state.maxDistance));
      session.close();
    }

    let allNodes = {...this.allNodes};
    let allLinks = {...this.allLinks};


    let nodeRelationCounts = {};
    let nodeNeighbours = {};
    let nodeLinks = {};

    let links = allLinks.records.filter(r => {
      return true;
    }).map(r => {
      let source = r.get("source");
      let target = r.get("target");
      let name = r.get("name");
      if (!nodeRelationCounts[target]) {
        nodeRelationCounts[target] = 0;
      }
      nodeRelationCounts[target] += 1;

      if (!nodeNeighbours[source]) {
        nodeNeighbours[source] = [];
      }
      if (!nodeNeighbours[target]) {
        nodeNeighbours[target] = [];
      }
      if (!nodeLinks[source]) {
        nodeLinks[source] = [];
      }
      if (!nodeLinks[target]) {
        nodeLinks[target] = [];
      }

      if (nodeNeighbours[source].indexOf(target) === -1) {
        nodeNeighbours[source].push(target);
      }
      if (nodeNeighbours[target].indexOf(source) === -1) {
        nodeNeighbours[target].push(source);
      }
      if (nodeLinks[source].indexOf(target) === -1) {
        nodeLinks[source].push(target);
      }
      if (nodeLinks[target].indexOf(source) === -1) {
        nodeLinks[target].push(source);
      }

      let sourceStatus = r.get("source_status");
      let targetStatus = r.get("target_status");
      let color = LINK_COLOURS[name] + LINK_OPACITY;
      if (this.hideClosed && (
        this.isStatusClosed(sourceStatus) ||
        this.isStatusClosed(targetStatus))) {
        color = LINK_COLOURS[name] + HIDDEN_OPACITY;
      }

      return {source, target, name, color, links: nodeLinks, neighbours: nodeNeighbours};
    });

    let nodeIds = [];
    let nodes = allNodes.records.filter(r => {
      // if (this.hideClosed && this.isStatusClosed(r.get('n').properties.field_issue_status)) {
      //   return false;
      // }
      return true;
    }).map(r => {
      let node = r.get('n');
      node.properties.distance = r.get('distance').toNumber();
      node.properties = this.processNodeProperties(node.properties);

      if(nodeRelationCounts[node.properties.nid] === undefined) {
        node.properties.targetted = 0;
      } else {
        node.properties.targetted = nodeRelationCounts[node.properties.nid] / 2;
      }
      nodeIds.push(node.properties.nid);

      if(nodeNeighbours[node.properties.nid] !== undefined) {
        node.properties.neighbours = nodeNeighbours[node.properties.nid];
      }
      if(nodeLinks[node.properties.nid] !== undefined) {
        node.properties.links = links.filter(link => (link.source === node.properties.nid || link.target === node.properties.nid));
      }

      return node.properties;
    });

    links = links.filter(r => {
      let sourceExists = nodeIds.indexOf(r.source);
      let targetExists = nodeIds.indexOf(r.target);
      return sourceExists !== -1 && targetExists !== -1;
    });

    this.setState({ data : {nodes, links}});

    this.hideTopBarLoader();
  }

  processNodeProperties(properties) {
    let fieldIssueStatus = properties.field_issue_status;
    properties.statusText = ISSUE_STATUSES[fieldIssueStatus];
    if (properties.nid === this.state.rootNodeId) {
      properties.color = '#ff0000';
    } else {
      properties.color = properties.colorOriginal = ISSUE_STATUS_COLORS[fieldIssueStatus];
      if (this.hideClosed && this.isStatusClosed(fieldIssueStatus)) {
        properties.color = ISSUE_STATUS_COLORS_RAW[fieldIssueStatus] + HIDDEN_OPACITY;
      }
    }
    properties.displayTitle = '#' + properties.nid + ': ' + properties.title + ' (' + properties.statusText + ', ' + PROJECTS[properties.field_project] + ')';

    return properties;
  }

  isStatusClosed = (field_issue_status) => {
    if (ISSUE_STATUSES[field_issue_status] === undefined) {
      return false;
    }
    return ISSUE_STATUSES[field_issue_status].search('Closed') !== -1;
  }

  toggleClosed = () => {
    this.hideClosed = !this.hideClosed;
    this.loadIssueData(false);
  }

  onNodeClick = async (node, event) => {
    this.setState({
      selectedNode: node,
      nodeDetails: null,
      isLoading: true
    });

    try {
      const response = await fetch(`https://www.drupal.org/api-d7/node.json?nid=${node.nid}`);
      const data = await response.json();
      data.list[0] = this.processNodeProperties(data.list[0]);

      node.displayTitle = data.list[0].displayTitle;
      this.setState({
        selectedNode: node,
        nodeDetails: data,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch node details:", error);
      this.setState({ isLoading: false });
    }
  }

  highlightNode = (nodeId) => {
    const node = this.state.data.nodes.find(node => node.nid === nodeId);
    if (node && this.fg) {
      this.fg.centerAt(node.x, node.y, 1000);
      this.onNodeClick(node);
    }
  }

  loadIssueByIdWithoutHistoryUpdate = async (id) => {
    const existingNode = this.state.data.nodes.find(node => node.nid === id);
    this.onNodeClick(existingNode);
  }

  loadIssueById = async (id) => {
    if (this.state.nodeDetails) {
      const currentIssueId = this.state.nodeDetails.list[0].nid;
      // Only push to history if we're not already viewing this issue
      if (currentIssueId !== id) {
        this.setState(prevState => ({
          issueHistory: [...prevState.issueHistory, currentIssueId]
        }));

        // Add to browser history
        window.history.pushState(
          { issueId: id },
          `Issue #${id}`,
          `?issue=${id}`
        );
      }
    } else {
      // First issue being opened
      window.history.pushState(
        { issueId: id },
        `Issue #${id}`,
        `?issue=${id}`
      );
    }

    // Check if this issue exists in our graph data
    const existingNode = this.state.data.nodes.find(node => node.nid === id);

    if (existingNode) {
      // If it exists in our graph, use the existing node click handler
      this.onNodeClick(existingNode);
    } else {
      // Create a minimal node object with just the ID
      const minimalNode = {
        nid: id,
        displayTitle: `#${id}: Unloaded node...`
      };

      this.onNodeClick(minimalNode);
    }
  }

  goBack = () => {
    if (this.state.issueHistory.length > 0) {
      // Get the last issue from history
      const prevState = [...this.state.issueHistory];
      const previousIssueId = prevState.pop();

      // Update history state
      this.setState({ issueHistory: prevState }, () => {
        // Load the previous issue without adding to history
        const existingNode = this.state.data.nodes.find(node => node.nid === previousIssueId);
        if (existingNode) {
          this.onNodeClick(existingNode);
        }
      });
    }
  }

  handleBodyClick = (event) => {
    // Find if we clicked on or inside an anchor tag
    let target = event.target;
    while (target && target !== event.currentTarget) {
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href) {
          // Match different Drupal issue URL patterns
          const issueMatch = href.match(/\/project\/drupal\/issues\/(\d+)/) ||
            href.match(/\/i\/(\d+)/) ||
            href.match(/\/node\/(\d+)/);
          if (issueMatch) {
            event.preventDefault();
            const issueId = issueMatch[1];
            this.loadIssueById(issueId);
            return;
          }
        }
      }
      target = target.parentElement;
    }
  }

  getIssueTitle = (id) => {
    // Check if we already have this node in our graph data
    const existingNode = this.state.data.nodes.find(node => node.nid === id);
    if (existingNode && existingNode.title) {
      return existingNode.title;
    }
    // Return just the ID if we don't have the title yet
    return 'cannot fetch title';
  }

  getExistingNode = (id) => {
    // Check if we already have this node in our graph data
    const existingNode = this.state.data.nodes.find(node => node.nid === id);
    if (existingNode && existingNode.title) {
      return existingNode;
    }
    // Return just the ID if we don't have the title yet
    return null;
  }

  closePopup = () => {
    this.setState({
      selectedNode: null,
      nodeDetails: null,
      issueHistory: [],
    });
  }

  render() {
    return (
      <div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px'
        }}>
          <SearchBar
            searchTerm={this.state.searchTerm}
            searchResults={this.state.searchResults}
            handleSearchChange={this.handleSearchChange}
            selectSearchResult={this.selectSearchResult}
          />
          <RootNodeInput
            rootNodeId={this.state.rootNodeId}
            onChange={this.updateRootNodeOnChange}
          />
          <MaxDistanceInput
            maxDistance={this.state.maxDistance}
            onChange={this.updateDistance}
          />
          <button
            onClick={this.toggleClosed}
            className={`toggle-button ${this.hideClosed ? 'toggle-inactive' : 'toggle-active'}`}
          >Toggle closed</button>

          {/* Add ref to the dropdown */}
          <select
            ref={this.statsDropdownRef}
            onChange={this.handleOrphanOptionChange}
            className="toggle-button toggle-active"
            style={{
              padding: '7px 8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            defaultValue=""
          >
            <option value="" disabled>Statistics and lists</option>
            <option value="load">Load orphans</option>
            <option value="stats">Orphan stats</option>
            <option value="components">Core component stats</option>
            <option value="referenced">Most referenced issues</option>
            <option value="meta">Meta issues</option>
          </select>

          <select
            value={this.state.projectId}
            onChange={this.handleProjectChange}
            className="toggle-button toggle-active"
            style={{
              padding: '7px 8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <option value="" disabled>Show all</option>
            <option value="">Normal mode</option>
            {Object.entries(PROJECTS).map(([id, name]) => (
              <option key={id} value={id}>Show all for {name}</option>
            ))}
          </select>

          {this.state.data.nodes.length > 0 && (
            <CurrentRootNode
              rootNodeId={this.state.rootNodeId}
              nodes={this.state.data.nodes}
            />
          )}

          {/* Loader component */}
          {this.state.topBarLoading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: 'auto',
              marginRight: '15px'
            }}>
              <div className="loading-spinner" />
              <span style={{ fontSize: '14px', color: '#555' }}>
                {this.state.loaderMessage}
              </span>
            </div>
          )}

        </div>

        <div style={{
          display: 'flex',
          height: 'calc(100vh - 65px)',  // Adjusted to remove status summary height
          overflow: 'hidden'  // Prevent any overflow
        }}>
          <div
            ref={this.graphContainerRef}
            style={{ flex: '1 1 auto', minWidth: 0 }}
          >
            <ForceGraph2D
              width={this.state.graphWidth}
              height={this.state.graphHeight}
              graphData={this.state.data}
              nodeId="nid"
              linkCurvature={0.1}linkWidth={link => this.state.highlightLinks.has(link) ? 5 : 1}
              linkDirectionalParticles={4}
              linkDirectionalParticleWidth={link => this.state.highlightLinks.has(link) ? 4 : 0}
              linkDirectionalArrowRelPos={1}
              linkDirectionalArrowLength={5}
              onNodeClick={this.onNodeClick}
              onNodeHover={this.handleNodeHover}
              onLinkHover={this.handleLinkHover}
              nodeCanvasObjectMode={node => this.state.highlightNodes.has(node) ? 'before' : undefined}
              nodeCanvasObject={(node, ctx, globalScale) => {
                if (this.state.highlightNodes.has(node)) {
                  this.paintRing(node, ctx);
                }
              }}
              nodeRelSize={3}
              nodeVal={node => node.targetted}
              nodeLabel={node => node.displayTitle}
            />
          </div>
          <IssueList
            nodes={this.state.data.nodes}
            onNodeClick={this.onNodeClick}
            onNodeHover={this.handleNodeHover}
          />
        </div>

        {/* Status Summary Component moved to bottom of screen */}
        {this.state.data.nodes.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px 10px',
            backgroundColor: '#f9f9f9',
            borderTop: '1px solid #ddd',
            zIndex: 100
          }}>
            <StatusSummary
              nodes={this.state.data.nodes}
              onStatusHover={this.handleStatusHover}
            />
          </div>
        )}

        {/* Popup Overlay */}
        {(this.state.selectedNode || this.state.searchResults.length > 0) && (
          <div
            style={{
              position: 'fixed',
              top: '65px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999
            }}
            onClick={() => {this.closePopup(); this.closeSearchResults() }}
          />
        )}

        {/* Popup Content */}
        {this.state.selectedNode && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            zIndex: 1000,
            maxWidth: '900px',
            width: '80%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div>
                {this.state.issueHistory.length > 0 && (
                  <button
                    onClick={this.goBack}
                    style={{
                      marginRight: '10px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  >
                    Back
                  </button>
                )}
              <h2 style={{ margin: 0 }}>{this.state.selectedNode.displayTitle}</h2>
              </div>
              <div>
              <button
                onClick={this.closePopup}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                X
              </button>
              </div>
            </div>

            {this.state.isLoading ? (
              <p>Loading issue details...</p>
            ) : this.state.nodeDetails ? (
              <IssueDetails
                nodeDetails={this.state.nodeDetails}
                data={this.state.data}
                loadIssueById={this.loadIssueById}
                getExistingNode={this.getExistingNode}
                updateRootNode={this.updateRootNode}
                handleBodyClick={this.handleBodyClick}
                selectedNode={this.state.selectedNode}
                isLoading={this.state.isLoading}
                issueHistory={this.state.issueHistory}
                goBack={this.goBack}
                closePopup={this.closePopup}
              />
            ) : (
              <p>Failed to load issue details.</p>
            )}
          </div>
        )}

        {/* Replace the orphan counts modal with the component */}
        <OrphanStatusModal
          show={this.state.showOrphanCountsModal}
          onClose={this.closeOrphanCountsModal}
          orphanStatusCounts={this.state.orphanStatusCounts}
          totalStatusCounts={this.state.totalStatusCounts}
        />

        {/* Add the component counts modal */}
        <ComponentStatusModal
          show={this.state.showComponentCountsModal}
          onClose={this.closeComponentCountsModal}
          componentCounts={this.state.componentCounts}
          projectName={PROJECTS["3060"]}
        />

        {/* Add the most referenced issues modal */}
        <MostReferencedModal
          show={this.state.showReferencedIssuesModal}
          onClose={this.closeReferencedIssuesModal}
          referencedIssues={this.state.referencedIssues}
          loadIssueById={this.loadIssueById}
        />

        {/* Add the meta issues modal */}
        <MetaIssuesModal
          show={this.state.showMetaIssuesModal}
          onClose={this.closeMetaIssuesModal}
          metaIssues={this.state.metaIssues}
          loadIssueById={this.loadIssueById}
        />
      </div>
    );
  }

}

export default CypherViz
