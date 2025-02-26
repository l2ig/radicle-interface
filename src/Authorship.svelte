<script lang="ts">
  import type { Config } from "@app/config";
  import { formatRadicleUrn, formatTimestamp } from "@app/utils";
  import Address from "@app/Address.svelte";
  import { Profile, ProfileType } from "@app/profile";
  import { onMount } from "svelte";
  import type { Author } from "@app/cobs";

  export let noAvatar = false;
  export let author: Author;
  export let timestamp: number;
  export let caption: string;
  export let config: Config;
  export let profile: Profile | null = null;

  onMount(async () => {
    if (author.profile?.ens?.name) {
      profile = await Profile.get(
        author.profile.ens.name,
        ProfileType.Minimal,
        config,
      );
    }
  });
</script>

<style>
  .authorship {
    display: flex;
    align-items: center;
    color: var(--color-foreground);
    padding: 0.125rem 0;
  }
  .caption {
    color: var(--color-foreground-5);
  }
  .highlight {
    color: var(--color-foreground-6);
    font-weight: var(--font-weight-bold);
  }
  .date {
    color: var(--color-foreground-6);
  }
</style>

<span class="authorship txt-tiny">
  {#if profile}
    <Address
      tiny
      highlight
      resolve
      noBadge
      compact
      {noAvatar}
      {config}
      {profile}
      address={profile.address} />
  {:else if author.profile}
    <span class="highlight">
      {author.profile.name}
    </span>
  {:else}
    <span class="highlight">
      {formatRadicleUrn(author.urn)}
    </span>
  {/if}
  <span class="caption">&nbsp;{caption}&nbsp;</span>
  <span class="txt-tiny date">
    {formatTimestamp(timestamp)}
  </span>
</span>
