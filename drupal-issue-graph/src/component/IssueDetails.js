// Add this new component at the end of the file

import React from 'react';
import { ISSUE_STATUSES } from '../util/constants';

const IssueDetails = ({
  nodeDetails,
  data,
  loadIssueById,
  getExistingNode,
  updateRootNode,
  handleBodyClick,
  selectedNode,
  isLoading,
  issueHistory,
  goBack,
  closePopup
}) => (
  <div>
    {nodeDetails && nodeDetails.list[0] && (
      <div className="issue-details">
        {/* Existing details grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '20px',
        }}>
          <div>
            <strong>Status:</strong>
            <div
              className={`field field-name-field-issue-status field-type-list-integer field-label-hidden field-issue-status-${
                (() => {
                  return nodeDetails.list[0].field_issue_status || 0; // Default to 1 (active) if not found
                })()
              }`}
              style={{display: 'inline-block'}}
            >
              <div className="field-items">
                <div className="field-item even">{ISSUE_STATUSES[nodeDetails.list[0].field_issue_status]}</div>
              </div>
            </div>
          </div>
          <div>
            <strong>Component:</strong> {nodeDetails.list[0].field_issue_component}
          </div>
          <div>
            <strong>Category:</strong> {nodeDetails.list[0].field_issue_category}
          </div>
          <div>
            <strong>Created:</strong> {new Date(nodeDetails.list[0].created * 1000).toLocaleDateString()}
          </div>
          <div>
            <strong>Changed:</strong> {new Date(nodeDetails.list[0].changed * 1000).toLocaleDateString()}
          </div>
          <div>
            <strong>Comments:</strong> {nodeDetails.list[0].comment_count}
          </div>
        </div>

        {/* Parent issue section */}
        {nodeDetails.list[0].field_issue_parent && (
          <div style={{ marginBottom: '15px' }}>
            <h3>Parent Issue</h3>
            <div
              className={`project-issue-issue-link project-issue-status-info project-issue-status-${
                (() => {
                  console.log(nodeDetails);
                  const parentId = nodeDetails.list[0].field_issue_parent.id;
                  const parentNode = data.nodes.find(node => node.nid === parentId);
                  console.log(parentNode);
                  return parentNode?.field_issue_status || 1; // Default to 1 (active) if not found
                })()
              }`}
              onClick={() => loadIssueById(nodeDetails.list[0].field_issue_parent.id)}
              style={{
                cursor: 'pointer',
                color: '#0678BE',
                textDecoration: 'underline'
              }}
            >
              <a title={(() => {
                const parentId = nodeDetails.list[0].field_issue_parent.id;
                const parentNode = data.nodes.find(node => node.nid === parentId);
                return ISSUE_STATUSES[parentNode?.field_issue_status || 1]; // Default to 1 (active) if not found
              })()}>{(() => {
                const parentId = nodeDetails.list[0].field_issue_parent.id;
                const parentNode = data.nodes.find(node => node.nid === parentId);
                return parentNode.displayTitle;
              })()}</a>
            </div>
          </div>
        )}

        {/* Related issues section */}
        {nodeDetails.list[0].field_issue_related &&
          nodeDetails.list[0].field_issue_related.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h3>Related Issues</h3>
              <ul style={{ paddingLeft: '20px' }}>
                {nodeDetails.list[0].field_issue_related.map(issue => (
                  <li key={issue.id}>
  <span
    className={`project-issue-issue-link project-issue-status-info project-issue-status-${
      (() => {
        const nodeData = data.nodes.find(node => node.nid === issue.id);
        return nodeData?.field_issue_status || 1; // Default to 1 (active) if not found
      })()
    }`}
    onClick={() => loadIssueById(issue.id)}
    style={{
      cursor: 'pointer',
      color: '#0678BE',
      textDecoration: 'underline'
    }}
  >
    <a title={(() => {
      const nodeData = data.nodes.find(node => node.nid === issue.id);
      return ISSUE_STATUSES[nodeData?.field_issue_status || 1]; // Default to 1 (active) if not found
    })()}>#{issue.id}: {getExistingNode(issue.id)?.title}</a>
  </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Existing link and body */}
        <div style={{ marginTop: '20px' }}>
          <a href={`https://www.drupal.org/i/${selectedNode.nid}`} target="_blank" rel="noopener noreferrer"
             style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#0678BE', color: 'white',
               textDecoration: 'none', borderRadius: '4px', marginRight: '10px' }}>
            View on Drupal.org
          </a>

          { isLoading === false ? (
            <div
              onClick={() => updateRootNode(nodeDetails.list[0].nid)}
              style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#0678BE', color: 'white',
                textDecoration: 'none', borderRadius: '4px', cursor: 'pointer' }}
              title="Make this issue the center of the graph visualization"
            >
              Set as Root Node
            </div>
          ): (<span/>)}
        </div>
        <h2>Issue summary</h2>
        <div className="issue-body"
             dangerouslySetInnerHTML={{ __html: nodeDetails.list[0].body.value }}
             onClick={handleBodyClick}
        />
      </div>
    )}
  </div>
);

export default IssueDetails;
