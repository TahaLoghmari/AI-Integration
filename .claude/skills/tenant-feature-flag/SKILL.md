---
name: tenant-feature-flag
description: Use this skill when asked to add a **new tenant-level feature flag** — a per-tenant boolean configuration that gates behaviour in the backend and/or frontend. This is distinct from a region-level or global App Configuration feature flag.
---

# Skill: Add a Tenant-Level Feature Flag

## Key Rules (Non-Negotiable)

- Flag names **must be identical** across all layers: Terraform variables, App Config keys, `TenantBlob`, `TenantOptions`, `Tenant`, `SettingConstant`, `ConfigDto`, `ConfigValues.ts`, and pipeline files.
- New flags **default to `false`** in `SettingConstant` unless product has explicitly approved a different default.
- Use nullable `bool?` in `TenantBlob` and `TenantOptions`; the non-nullable value lives on `Tenant` (or as `bool?` if the feature genuinely needs a three-state value).
- Apply the fallback chain: `TenantBlob` value → `SettingConstant` default (resolved in `TenantOptionsService`).
- In the controller, always resolve the flag through `_tenantContext.CurrentTenant.<FlagName>`, never read `TenantOptions` directly.
- Update `SM_Tenant_Feature_Flag_Changes.yml` **in the same change** as the code.

---

## File Checklist & Change per File

The flag name placeholder below is `<FlagName>` (e.g. `EnableMyFeature`). Use PascalCase in C# and camelCase/snake_case as shown per file.

---

### 1. `src/SIM.Auth/Tenant/TenantBlob.cs`

**Role:** JSON blob schema (storage representation). Use `bool?` so existing blobs without the key fall back gracefully.

```csharp
public bool? <FlagName> { get; set; }
```

---

### 2. `src/SIM.Auth/Tenant/TenantOptions.cs`

**Role:** App Configuration binding class. Use `bool?` or `bool` to match whether a per-tenant default is needed.

```csharp
public bool <FlagName> { get; set; }   // non-nullable — resolved via SettingConstant
// OR
public bool? <FlagName> { get; set; }  // nullable — three-state (true/false/null=default)
```

---

### 3. `src/SIM.Auth/Tenant/Tenant.cs`

**Role:** Domain model. Maps from `TenantOptions`.

Add the property:
```csharp
public virtual bool <FlagName> { get; set; }
```

Assign it in the constructor:
```csharp
<FlagName> = tenantOptions.<FlagName>;
```

---

### 4. `src/SIM.Common/Constant/SettingConstant.cs`

**Role:** Global fallback defaults (used when tenant blob has `null`).

Add to `SettingConstant`:
```csharp
public static bool <FlagName> = false;
```

Add to `TenantFeatureFlagDefaults` (used during tenant onboarding):
```csharp
public static bool <FlagName> = false;
```

> Set to `true` here only if the flag should be ON for all newly onboarded tenants by default.

---

### 5. `src/SIM.Infrastructure/TenantService/TenantOptionsService.cs`

**Role:** Loads the blob and builds `TenantOptions` with `SettingConstant` fallback.

Inside `CreateTenantOptionsFromBlob`, add:
```csharp
<FlagName> = tenantBlob.<FlagName> ?? SettingConstant.<FlagName>,
```

---

### 6. `src/SIM.CustomerView.Web/Features/Configs/Models/ConfigDto.cs`

**Role:** API response DTO. Exposes the flag to the frontend.

Add to `ConfigDto` (for direct tenant flags) **or** to `FeatureFlagsDto` (for region/App-Config-managed flags). Tenant-blob flags go directly on `ConfigDto`:
```csharp
public bool <FlagName> { get; set; }
```

---

### 7. `src/SIM.CustomerView.Web/Features/Configs/ConfigurationController.cs`

**Role:** Builds the `ConfigDto` response. Always read from `_tenantContext.CurrentTenant`.

```csharp
// In the Get() method, inside new ConfigDto { ... }:
<FlagName> = tenantContext.CurrentTenant.<FlagName>,
```

> Do NOT inject `TenantOptions` directly here. Always resolve via `ITenantContext.CurrentTenant`.

---

### 8. `src/SIM.CustomerView.Web/ClientApp/src/components/layout/model/ConfigValues.ts`

**Role:** TypeScript model + API client. Use camelCase.

Add to `IConfigValues`:
```typescript
<flagName>: boolean;  // camelCase version of the C# property
```

---

### 9. `src/SIM.CustomerView.Web/ClientApp/src/__tests__/__mocks__/layout/mockAPIConfigValues.tsx`

**Role:** Frontend test mock. Must be updated or tests will fail with missing property errors.

Add to the `configValues` mock object:
```typescript
<flagName>: false,   // default safe value for tests
```

---

### 10. `src/SIM.CustomerView.Web/appsettings.Development.json`

**Role:** Local development tenant configuration. Add the flag to the dev tenant entry so local runs reflect the expected state.

```json
"Tenants": {
  "MainTenantManager": {
    "<FlagName>": false
  }
}
```

---

### 11. `src/SIM.TenantOnboarding.Application/Model/ModuleStatusChangeRequest.cs`

**Role:** Onboarding request model. Allows per-tenant override during onboarding.

Add to `FeatureFlagOverrides`:
```csharp
public bool? <FlagName> { get; set; }
```

---

### 12. `src/SIM.TenantOnboarding.Infrastructure/Service/ModuleStatusChangeService.cs`

**Role:** Creates the initial tenant blob during onboarding. Falls back to `TenantFeatureFlagDefaults`.

Inside `CreateTenantBlobAsync`, in the `new TenantBlob { ... }` initializer:
```csharp
<FlagName> = request.FeatureFlags?.<FlagName> ?? TenantFeatureFlagDefaults.<FlagName>,
```

---

### 13. `src/SIM.Tools.RegionTenantsMigrator/Application/RegionTenantsMigratorService.cs`

**Role:** Migrates tenant configs from App Configuration to regional blob storage. Without this, migrated tenants lose the flag.

Inside `CreateTenantBlob`, in the `new TenantBlob { ... }` initializer:
```csharp
<FlagName> = tenant.<FlagName>,
```

---

### 14. Terraform — `infrastructure/terraform/tenantonboarding/`

Four files must all be updated in sync. The flag name in Terraform uses `snake_case` (e.g. `enable_my_feature`).

#### 14a. `module/app_config/variables.tf`

Add the field inside the `app_config` object type in the `tenants` variable:
```hcl
<flag_name> = optional(bool, false)
```

#### 14b. `module/app_config/main.tf`

Add a new `azurerm_app_configuration_key` resource:
```hcl
resource "azurerm_app_configuration_key" "<tf_resource_name>" {
  for_each               = { for t in var.tenants : lower(t.name) => t }
  configuration_store_id = var.dependencies.app_config.id
  key                    = "Tenants:${lower(each.value.name)}:<FlagName>"
  value                  = tostring(each.value.app_config.<flag_name>)
  content_type           = "application/json"
  locked                 = false
}
```

> The `key` value must match exactly `Tenants:{tenantId}:<FlagName>` — this is the path `TenantOptions` binds from.

#### 14c. `module/main/variables.tf`

Add the same field inside the `app_config` object type in the `tenants` variable:
```hcl
<flag_name> = optional(bool, false)
```

#### 14d. `devsubscription/variables.tf` and `prodsubscription/variables.tf`

Add the same field inside the `app_config` object type in the `tenants` variable in both files:
```hcl
<flag_name> = optional(bool, false)
```

---

### 15. `infrastructure/pipelines/templates/download-tenant-config.yml`

**Role:** Downloads tenant JSON blobs and converts them to Terraform-compatible tfvars. Without this, the flag value from the blob is ignored by the pipeline.

Find the `$appConfig = [PSCustomObject]@{` block and add:
```powershell
<flagName> = Get-BoolOrDefault($tenantBlob.<FlagName>)
```

> The key name here must match the Terraform `app_config` variable field name exactly (camelCase matches `snake_case` with Terraform's HCL convention).

---

### 16. `infrastructure/pipelines/SM_Tenant_Feature_Flag_Changes.yml`

**Role:** Manual ADO pipeline for enabling/disabling flags per tenant in blob storage.

Add a pipeline parameter:
```yaml
- name: <flagName>
  displayName: '[Feature Flag] <Human-readable description>'
  default: '(no change)'
  values:
    - '(no change)'
    - 'Enable'
    - 'Disable'
```

Add the corresponding `jq` update step in the pipeline script section:
```bash
if [ "${{ parameters.<flagName> }}" = "Enable" ]; then
  jq '. + {"<FlagName>": true}' "$localFile" > "${localFile}.tmp" && mv "${localFile}.tmp" "$localFile"
elif [ "${{ parameters.<flagName> }}" = "Disable" ]; then
  jq '. + {"<FlagName>": false}' "$localFile" > "${localFile}.tmp" && mv "${localFile}.tmp" "$localFile"
fi
```

---

## Additive Rollout Order

1. **Introduce** — Add the flag to all layers above with `false` default. Deploy.
2. **Wire** — Validate the flag flows end-to-end (blob → options → tenant → API → frontend). No tenants enabled yet.
3. **Validate** — Enable the flag for a single test tenant via `SM_Tenant_Feature_Flag_Changes.yml`. Confirm behaviour.
4. **Enable** — Roll out to remaining tenants via the pipeline, one environment at a time.

---

## Completion Gate

Before marking the task done, confirm all of the following:

| Area | Status |
|------|--------|
| `TenantBlob.cs` | updated |
| `TenantOptions.cs` | updated |
| `Tenant.cs` | updated |
| `SettingConstant.cs` (both classes) | updated |
| `TenantOptionsService.cs` | updated |
| `ConfigDto.cs` | updated |
| `ConfigurationController.cs` | updated |
| `ConfigValues.ts` | updated |
| `mockAPIConfigValues.tsx` | updated |
| `appsettings.Development.json` | updated |
| `ModuleStatusChangeRequest.cs` (`FeatureFlagOverrides`) | updated |
| `ModuleStatusChangeService.cs` | updated |
| `RegionTenantsMigratorService.cs` | updated |
| Terraform: `module/app_config/variables.tf` | updated |
| Terraform: `module/app_config/main.tf` | updated |
| Terraform: `module/main/variables.tf` | updated |
| Terraform: `devsubscription/variables.tf` | updated |
| Terraform: `prodsubscription/variables.tf` | updated |
| `download-tenant-config.yml` | updated |
| `SM_Tenant_Feature_Flag_Changes.yml` | updated |
