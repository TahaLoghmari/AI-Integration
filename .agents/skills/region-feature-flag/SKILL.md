---
name: region-feature-flag
description: Use this skill when asked to add a **new region-level feature flag** — a per-region boolean configuration that gates behaviour in the backend and/or frontend. This is distinct from a tenant-level or global App Configuration feature flag.
---

# Skill: Add a Region-Level Feature Flag

## Key Rules (Non-Negotiable)

- Flag names **must be identical** across all layers: Terraform variables, blob JSON, `FeatureManagementBlob`, `FeatureFlags`, `RegionalApplicationBlobConfigurationProvider`, `FeatureFlagsDto`, `ConfigurationController`, `appsettings`, `ConfigValues.ts`, and mock files.
- New flags **default to `false`** in all Terraform variable declarations and appsettings unless explicitly approved otherwise.
- Use `optional(bool, false)` in **all four** Terraform region env variable files — never a bare `bool`, which would break environments that haven't set the value.
- In the controller, always resolve the flag through `featureManager.IsEnabledAsync(FeatureFlags.<FlagName>)`, never read the blob directly.
- The `FeatureManagement` map in the blob `source_content` and the `azurerm_app_configuration_feature` resource are **both** required in `module/app_config/main.tf` — each serves a different consumer.
- **Do NOT touch `infrastructure/terraform/tenantonboarding/`.** That directory holds only per-**tenant** App Configuration keys (`Tenants:<name>:<Key>`). A region flag placed there becomes a tenant flag, which is the wrong construct. No existing region flag (e.g. R152–R155) appears there. If a per-tenant toggle is genuinely also needed, that is a separate tenant-level flag — use the `tenant-feature-flag` skill for it.

---

## Naming Conventions

The flag name placeholder below is `<FlagName>` (e.g. `R156_EnableNewFeature`).

| Layer | Casing | Example |
|---|---|---|
| C# / JSON / blob key | PascalCase with underscores, uppercase first letter | `R156_EnableNewFeature` |
| Terraform HCL field | Same as C#, but first character lowercased | `r156_EnableNewFeature` |
| Terraform resource name | `snake_case` | `app_feature_r156_EnableNewFeature` |
| TypeScript | First character lowercased only | `r156_EnableNewFeature` |

---

## File Checklist & Change per File

---

### 1–4. Terraform — Four Region Env `variables.tf` Files

All four files declare the same `featureManagement` object type and must be kept in sync. Add the flag to each:

```hcl
<flag_name> = optional(bool, false)
```

Files:
- `infrastructure/terraform/environments/region/devsubscription/variables.tf`
- `infrastructure/terraform/environments/region/prodsubscription/variables.tf`
- `infrastructure/terraform/environments/region/module/app_config/variables.tf`
- `infrastructure/terraform/environments/region/module/main/variables.tf`

---

### 5. `infrastructure/terraform/environments/region/module/app_config/main.tf`

Two additions required:

**A. Add an `azurerm_app_configuration_feature` resource** (after the last existing one):

```hcl
resource "azurerm_app_configuration_feature" "app_feature_<flag_name>" {
  configuration_store_id = var.dependencies.app_config.id
  description            = "<Human-readable description of the flag>"
  name                   = "<FlagName>"
  label                  = ""
  enabled                = var.app_config.app.featureManagement.<flag_name>
  locked                 = false
}
```

**B. Add an entry to the `FeatureManagement` map inside `azurerm_storage_blob.app_settings_blob.source_content`**:

```hcl
<FlagName> = var.app_config.app.featureManagement.<flag_name>
```

> Both A and B are required. A registers the flag in Azure App Configuration. B writes it into the regional blob that `RegionalApplicationBlobConfigurationProvider` reads at startup.

---

### 6. `src/SIM.Common/Configuration/BlobConfiguration/FeatureManagementBlob.cs`

**Role:** C# POCO that deserialises the regional blob's `FeatureManagement` JSON section.

Add the property:

```csharp
public bool <FlagName> { get; set; }
```

---

### 7. `src/SIM.Common/FeatureManagement/FeatureFlags.cs`

**Role:** Canonical string constants used to reference feature flags in C# code.

Add the constant:

```csharp
public const string <FlagName> = nameof(<FlagName>);
```

---

### 8. `src/SIM.Common/Configuration/BlobConfiguration/CustomConfigurationProvider/RegionalApplicationBlobConfigurationProvider.cs`

**Role:** Maps `FeatureManagementBlob` properties into the ASP.NET configuration dictionary at startup.

Inside `MapFeatureManagement()`, add:

```csharp
data[$"FeatureManagement:{nameof(blob.FeatureManagement.<FlagName>)}"] = blob.FeatureManagement.<FlagName>.ToString();
```

---

### 9. `src/SIM.CustomerView.Web/Features/Configs/Models/ConfigDto.cs`

**Role:** API response DTO. Region feature flags belong on `FeatureFlagsDto` (not the root `ConfigDto`).

Add to `FeatureFlagsDto`:

```csharp
public bool <FlagName> { get; set; }
```

---

### 10. `src/SIM.CustomerView.Web/Features/Configs/ConfigurationController.cs`

**Role:** Builds the `ConfigDto` response. Resolves feature flags via the `IFeatureManager`.

Inside the `Get()` action, in the `FeatureFlags = new() { ... }` initializer:

```csharp
<FlagName> = await featureManager.IsEnabledAsync(FeatureFlags.<FlagName>),
```

> Do NOT read the blob or `FeatureManagementBlob` directly here. Always go through `featureManager.IsEnabledAsync`.

---

### 11. `src/SIM.CustomerView.Web/appsettings.json`

**Role:** Production baseline (all flags default to `false`).

Add to the `FeatureManagement` section:

```json
"<FlagName>": false
```

---

### 12. `src/SIM.CustomerView.Web/appsettings.Development.json`

**Role:** Local development override. Set to whatever value is appropriate for local dev (often `true` to work with the feature locally).

Add to the `FeatureManagement` section:

```json
"<FlagName>": false
```

---

### 13. `src/SIM.CustomerView.Web/ClientApp/src/components/layout/model/ConfigValues.ts`

**Role:** TypeScript model and initial state. Use the camelCase variant of the flag name (first character lowercased only).

Two additions:

**A. Add to the `FeatureFlagsDto` interface:**

```typescript
<flagName>: boolean;
```

**B. Add to the `featureFlags` object inside `getInitialConfigs()`:**

```typescript
<flagName>: false,
```

> C# serialises `R156_EnableNewFeature` → `r156_EnableNewFeature` (only the first character is lowercased).

---

### 14. `mockAPIConfigValues.tsx`

**Role:** Frontend test mock. Must mirror `FeatureFlagsDto` or tests fail with missing-property errors.

Add to the `featureFlags` object in the mock:

```typescript
<flagName>: false,
```

---

## Completion Gate

Before marking the task done, confirm every item in this checklist:

| Area | File | Status |
|------|------|--------|
| Terraform variable (devsubscription) | `environments/region/devsubscription/variables.tf` | updated |
| Terraform variable (prodsubscription) | `environments/region/prodsubscription/variables.tf` | updated |
| Terraform variable (module/app_config) | `environments/region/module/app_config/variables.tf` | updated |
| Terraform variable (module/main) | `environments/region/module/main/variables.tf` | updated |
| Terraform feature resource | `environments/region/module/app_config/main.tf` (resource) | updated |
| Terraform blob FeatureManagement map | `environments/region/module/app_config/main.tf` (blob) | updated |
| C# blob model | `FeatureManagementBlob.cs` | updated |
| C# constant | `FeatureFlags.cs` | updated |
| C# config provider mapping | `RegionalApplicationBlobConfigurationProvider.cs` | updated |
| C# API DTO | `ConfigDto.cs` (`FeatureFlagsDto`) | updated |
| C# controller | `ConfigurationController.cs` | updated |
| JSON prod baseline | `appsettings.json` | updated |
| JSON dev override | `appsettings.Development.json` | updated |
| TypeScript interface | `ConfigValues.ts` (`FeatureFlagsDto`) | updated |
| TypeScript initial state | `ConfigValues.ts` (`getInitialConfigs`) | updated |
| TypeScript test mock | `mockAPIConfigValues.tsx` | updated |
| Backend test | `ConfigurationController` test — flag resolved via feature manager and present in the config response | added/updated |

> **Not touched:** `tenantonboarding/module/app_config/*`. That is per-tenant configuration, not region flags — see Key Rules.
