# @codedazur/cdk-site-distribution

## Migration Guide

### Migrating from `v0` to `v1`

Version `1.0.0` introduces a breaking change to how DNS records are managed. To prevent conflicts with existing records, the `ARecord` resources now automatically delete records with the same name before creating new ones.

To migrate, you must manually delete any existing `ARecord`s that were created by a `v0` version of this construct. After removing the records, you can safely deploy the `v1` version.

Failure to remove the old records will result in a deployment failure.
