# Deepening

How to deepen a cluster of shallow modules, given its dependencies. Terms and seam rules are in [SKILL.md](../SKILL.md).

## Dependency categories

### 1. In-process

Pure computation, in-memory state, no I/O. Always deepenable: merge the modules and test through the new interface. No adapter.

### 2. Local-substitutable

Dependencies with a local test stand-in (PGLite for Postgres, an in-memory filesystem). Deepenable when the stand-in exists. Tests run the stand-in. The seam stays internal: no port on the external interface.

### 3. Remote but owned (ports and adapters)

Your own services across a network (microservices, internal APIs). Define a port at the seam. The deep module owns the logic, and transport is an injected adapter: in-memory in tests, HTTP, gRPC, or a queue in production.

### 4. True external (mock)

Third-party services you do not control (Stripe, Twilio). The deepened module takes the dependency as an injected port. Tests provide a mock adapter.

## Testing: replace, don't layer

- Delete the old unit tests of the shallow modules once tests exist at the deepened interface.
- Write tests at that interface, as [test-behavior](../principles/test-behavior.md) says.
