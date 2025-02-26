<script lang="ts">
  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import { Project, ProjectContent } from "@app/project";
  import type { CommitMetadata, CommitsHistory } from "@app/commit";
  import { groupCommits } from "@app/commit";
  import List from "@app/List.svelte";

  export let project: Project;
  export let history: CommitsHistory;

  const navigateHistory = (revision: string, content?: ProjectContent) => {
    project.navigateTo({
      content,
      revision,
      issue: null,
      patch: null,
      path: null,
    });
  };

  const fetchMoreCommits = async (): Promise<CommitMetadata[]> => {
    const response = await Project.getCommits(project.urn, project.seed.api, {
      // Fetching 31 elements since we remove the first one
      parent: history.headers[history.headers.length - 1].header.sha1,
      perPage: 31,
      verified: true,
    });
    // Removing the first element of the array, since it's the same as the last of the current list
    return response.headers.slice(1);
  };

  const browseCommit = (event: { detail: string }) => {
    project.navigateTo({
      content: ProjectContent.Tree,
      revision: event.detail,
      issue: null,
      path: null,
    });
  };
</script>

<style>
  .history {
    padding: 0 2rem 0 8rem;
    font-size: var(--font-size-small);
  }
  .commit-group header {
    color: var(--color-foreground-6);
  }
  .commit-group-headers {
    margin-bottom: 2rem;
  }

  .commit {
    background-color: var(--color-foreground-1);
  }
  .commit:not(:last-child) {
    border-bottom: 1px dashed var(--color-background);
  }
  .commit:hover {
    background-color: var(--color-foreground-2);
    cursor: pointer;
  }
  .commit:first-child {
    border-top-left-radius: var(--border-radius-small);
    border-top-right-radius: var(--border-radius-small);
  }
  .commit:last-child {
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
  }

  @media (max-width: 960px) {
    .history {
      padding-left: 2rem;
    }
  }
</style>

<div class="history">
  <List bind:items={history.headers} query={fetchMoreCommits}>
    <svelte:fragment slot="list" let:items>
      {@const headers = groupCommits(items)}
      {#each headers as group (group.time)}
        <div class="commit-group">
          <header class="commit-date">
            <p>{group.date}</p>
          </header>
          <div class="commit-group-headers">
            {#each group.commits as commit (commit.header.sha1)}
              <div
                class="commit"
                on:click={() =>
                  navigateHistory(commit.header.sha1, ProjectContent.Commit)}>
                <CommitTeaser {commit} on:browseCommit={browseCommit} />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </svelte:fragment>
  </List>
</div>
