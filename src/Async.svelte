<script lang="ts">
  import Loading from "@app/Loading.svelte";

  type T = $$Generic;

  export let fetch: Promise<T>;
</script>

{#await fetch}
  <Loading center />
{:then result}
  <slot {result} />
{:catch err}
  <div class="commit">
    <div class="error error-message txt-tiny">
      <div>
        API request to <span class="txt-monospace">{err.url}</span>
        failed.
      </div>
    </div>
  </div>
{/await}
