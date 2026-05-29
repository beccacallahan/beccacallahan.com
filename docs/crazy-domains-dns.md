# Crazy Domains DNS Checklist

Use the **DNS Settings** tab for `beccacallahan.com`. Do not change the **Name Servers** tab unless you are intentionally moving DNS hosting away from Crazy Domains.

## Records

Add or update these records:

```text
Type    Host/Name    Value
A       @            185.199.108.153
A       @            185.199.109.153
A       @            185.199.110.153
A       @            185.199.111.153
CNAME   www          beccacallahan.github.io
```

Optional IPv6 records:

```text
Type    Host/Name    Value
AAAA    @            2606:50c0:8000::153
AAAA    @            2606:50c0:8001::153
AAAA    @            2606:50c0:8002::153
AAAA    @            2606:50c0:8003::153
```

## Remove Conflicts

Remove or replace any existing parking, forwarding, website-builder, or old hosting records for:

```text
@
www
```

## GitHub Pages

The repository should keep this custom domain:

```text
www.beccacallahan.com
```

This is also stored in the repo's `CNAME` file.
