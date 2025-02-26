<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { navigate } from "svelte-routing";
  import Modal from "@app/Modal.svelte";
  import type { Config } from "@app/config";
  import { formatAddress, isAddressEqual } from "@app/utils";
  import type { User } from "@app/base/users/User";
  import ErrorModal from "@app/ErrorModal.svelte";
  import Button from "@app/Button.svelte";
  import TextInput from "@app/TextInput.svelte";
  import Loading from "@app/Loading.svelte";

  const dispatch = createEventDispatcher();

  export let entity: User;
  export let config: Config;

  enum State {
    Idle,
    Checking,

    Signing,
    Pending,
    Success,

    Failed,
    Mismatch,
  }

  let name = "";
  let state = State.Idle;
  let error: string | null = null;

  const onSubmit = async () => {
    if (!valid) {
      return;
    }
    state = State.Checking;

    const domain = `${name}.${config.registrar.domain}`;
    const resolved = await config.provider.resolveName(domain);

    if (resolved && isAddressEqual(resolved, entity.address)) {
      try {
        state = State.Signing;
        const tx = await entity.setName(domain, config);
        state = State.Pending;
        await tx.wait();
        state = State.Success;
      } catch (e) {
        console.error(e);
        state = State.Failed;
        if (e instanceof Error) {
          error = e.message;
        } else {
          error = "Unknown error. Check dev console for details.";
        }
      }
    } else {
      state = State.Mismatch;
    }
  };

  $: valid = name !== "" && state === State.Idle;
</script>

<style>
  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
</style>

{#if state === State.Success}
  <Modal floating>
    <div slot="title">✅</div>

    <div slot="subtitle">
      The ENS name for {entity.address} was set to
      <span class="txt-bold">{name}.{config.registrar.domain}</span>
      .
    </div>

    <div slot="actions">
      <Button variant="secondary" on:click={() => dispatch("close")}>
        Done
      </Button>
    </div>
  </Modal>
{:else if state === State.Mismatch}
  <ErrorModal floating title="🧣" on:close>
    The name <span class="txt-bold">{name}.{config.registrar.domain}</span>
    does not resolve to
    <span class="txt-bold">{entity.address}</span>
    . Please update the ENS record for {name}.{config.registrar.domain} to point
    to the correct address and try again.

    <div slot="actions">
      <Button
        variant="negative"
        on:click={() => navigate(`/registrations/${name}`)}>
        Go to registration &rarr;
      </Button>
      <Button variant="negative" on:click={() => dispatch("close")}>
        Close
      </Button>
    </div>
  </ErrorModal>
{:else if state === State.Failed && error}
  <ErrorModal floating title="Transaction failed" message={error} on:close />
{:else}
  <Modal floating>
    <div slot="title">
      <div>🧣</div>
      <span>Associate profile</span>
    </div>

    <div slot="subtitle">
      {#if state === State.Signing}
        Please confirm the transaction in your wallet.
      {:else if state === State.Pending}
        Waiting for transaction to be processed…
      {:else}
        Set an ENS name for <span class="txt-bold">
          {formatAddress(entity.address)}
        </span>
        to associate a profile. ENS profiles provide human-identifiable data to your
        profile, such as a unique name, avatar and URL, and help make your profile
        more discoverable.
      {/if}
    </div>

    <div slot="body" style="display: flex; justify-content:center;">
      {#if state === State.Idle || state === State.Checking}
        <div style="width: 22rem;">
          <TextInput
            autofocus
            disabled={state !== State.Idle}
            on:submit={onSubmit}
            loading={state === State.Checking}
            {valid}
            bind:value={name}>
            <svelte:fragment slot="right">
              .{config.registrar.domain}
            </svelte:fragment>
          </TextInput>
        </div>
      {:else}
        <Loading small center />
      {/if}
    </div>

    <div slot="actions" class="actions">
      {#if state === State.Signing}
        <Button variant="secondary" on:click={() => dispatch("close")}>
          Cancel
        </Button>
      {:else if state === State.Pending}
        <Button variant="secondary" on:click={() => dispatch("close")}>
          Close
        </Button>
      {:else}
        <Button variant="primary" on:click={onSubmit} disabled={!valid}>
          Submit
        </Button>

        <Button variant="text" on:click={() => dispatch("close")}>
          Cancel
        </Button>
      {/if}
    </div>
  </Modal>
{/if}
