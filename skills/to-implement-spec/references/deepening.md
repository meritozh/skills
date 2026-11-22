# Deepening

How to deepen a cluster of shallow modules, given its dependencies. Terms are defined in [SKILL.md](../SKILL.md). Seam rules live there too: one adapter is a hypothetical seam, two make it real, and internal seams stay off the interface.

## Dependency categories

The category decides how the deepened module is tested across its seam.

### 1. In-process

Pure computation, in-memory state, no I/O. Always deepenable: merge the modules and test through the new interface. No adapter.

### 2. Local-substitutable

Dependencies with a local test stand-in (PGLite for Postgres, an in-memory filesystem). Deepenable when the stand-in exists. Tests run the stand-in. The seam stays internal. No port on the module's external interface.

### 3. Remote but owned (ports and adapters)

Your own services across a network (microservices, internal APIs). Define a port at the seam. The deep module owns the logic. Transport is an injected adapter. Tests use an in-memory adapter. Production uses an HTTP, gRPC, or queue adapter.

Recommendation shape: "Define a port at the seam, implement an HTTP adapter for production and an in-memory adapter for testing, so the logic sits in one deep module even though it is deployed across a network."

### 4. True external (mock)

Third-party services you do not control (Stripe, Twilio). The deepened module takes the dependency as an injected port. Tests provide a mock adapter.

## Testing: replace, don't layer

- Delete the old unit tests of the shallow modules once tests exist at the deepened interface.
- Write tests at that interface. The interface is the test surface.
- Assert observable outcomes through the interface, not internal state.
- Tests should survive an internal refactor. A test that changes when the implementation changes is testing past the interface.
