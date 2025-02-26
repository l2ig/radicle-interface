<script lang="ts">
  import type { CommitMetadata } from "@app/commit";
  import { formatCommit } from "@app/utils";
  import { createEventDispatcher } from "svelte";

  import Icon from "@app/Icon.svelte";
  import CommitAuthorship from "./CommitAuthorship.svelte";
  import CommitVerifiedBadge from "./CommitVerifiedBadge.svelte";

  export let commit: CommitMetadata;

  const dispatch = createEventDispatcher();

  function browseCommit(commit: string) {
    dispatch("browseCommit", commit);
  }
</script>

<style>
  .hash {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
    padding: 0 1.5rem;
  }
  .commit-teaser {
    background-color: var(--color-foreground-1);
    padding: 0.75rem 0rem;
  }
  .commit-teaser:hover {
    background-color: var(--color-foreground-2);
  }
  .commit-teaser:first-child {
    border-top-left-radius: var(--border-radius-small);
    border-top-right-radius: var(--border-radius-small);
  }
  .commit-teaser:last-child {
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
  }
  .commit-teaser {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .column-left {
    padding-left: 1rem;
    flex: min-content;
  }
  .commit-teaser .column-right {
    display: flex;
    align-items: center;
    padding-right: 1.5rem;
  }
  .summary {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 1rem;
  }
  .browse {
    display: flex;
    z-index: 10;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 720px) {
    .hash {
      padding-right: 0;
    }
    .column-left {
      overflow: hidden;
    }
    .browse {
      display: none !important;
    }
    .summary {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-right: 1rem;
    }
  }
</style>

<div class="commit-teaser">
  <div class="column-left">
    <div class="header">
      <div class="summary">
        {commit.header.summary}
      </div>
    </div>
    <CommitAuthorship {commit} noDelegate />
  </div>
  <div class="column-right">
    {#if commit.context.committer}
      <div class="desktop">
        <CommitVerifiedBadge {commit} />
      </div>
    {/if}
    <span class="secondary hash">{formatCommit(commit.header.sha1)}</span>
    <div
      class="browse"
      title="View file"
      on:click|stopPropagation={() => browseCommit(commit.header.sha1)}>
      <Icon name="browse" />
    </div>
  </div>
</div>
