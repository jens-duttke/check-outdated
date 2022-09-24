# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.11.0...HEAD)

## [2.11.0] - 2022-09-24

### Added

- `--ignore-packages` now support semver ranges like `foo@^2`, `foo@~2.3.4`, `foo@2.*`, `foo@2.3.x`

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.10.2...v2.11.0)

## [2.10.2] - 2021-09-25

### Fixed

- Fixed syntax error with Node.js v13 and below

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.10.0...v2.10.2)

## [2.10.0] - 2021-09-18

### Changed

- Now supporting other "base" branches than `master` on GitHub, to find the CHANGELOG.md

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.9.0...v2.10.0)

## [2.9.0] - 2021-09-09

### Changed

- For reverted versions, the "Type" column shows "reverted"
- The package names of reverted versions are shown in red
- The package name color of major-updates changed to yellow, and of minor-updates changed to cyan

### Added

- Added `--types` option to restrict the visible versions.

### Fixed

- Show `wanted` and `latest` version numbers even if `current` is empty

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.8.0...v2.9.0)

## [2.8.0] - 2021-05-22

### Changed

- Rename `name` column to `package`
- Changed the minimum required NodeJS version to v10.0.0

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.7.0...v2.8.0)

## [2.7.0] - 2021-03-24

### Added

- New `--prefer-wanted` option, which compares the the `Current` version to the `Wanted` version, instead of the `Latest` version. This allow you to ensure that your installed version is the latest in the specified version range, but not necessary the latest available version ([#7](https://github.com/jens-duttke/check-outdated/issues/7))

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.6.0...v2.7.0)

## [2.6.0] - 2021-03-14

### Changed

- Change colorization of dependency name
- Reorder default columns
- Remove "Type" from default columns

### Added

- Added "Color legend"
- Group dependencies by their type

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.5.1...v2.6.0)

## [2.5.1] - 2021-02-26

### Fixed

- Remove ".git" extension from GitHub repository URLs

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.5.0...v2.5.1)

## [2.5.0] - 2020-12-16

### Fixed

- Sub-packages in mono-repositories on GitHub (like Gatsby) are now considered for CHANGELOG.md-link generation

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.4.1...v2.5.0)

## [2.4.1] - 2020-09-29

### Changed

- Improve CHANGELOG.md detection

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.4.0...v2.4.1)

## [2.4.0] - 2020-09-26

### Fixed

- Only link to CHANGELOG.md files on GitHub if they have content

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.3.2...v2.4.0)

## [2.3.2] - 2020-08-04

### Changed

- Optimize detection of item in package.json for generting the Reference link

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.3.1...v2.3.2)

## [2.3.1] - 2020-08-04

### Fixed

- Fix missing Reference link, if the installed package version does not match the version in the package.json

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.3.0...v2.3.1)

## [2.3.0] - 2020-06-24

### Added

- If a CHANGELOG.md exists in the GitHub repository, the Changes row, will link to this file, instead of the Releases page

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.2.0...v2.3.0)

## [2.2.0] - 2020-05-16

### Added

- Add "Reference" column, which contains a link to the line and column of the dependency in the package.json.
  By using a terminal which supports clicking on such links, you can navigate directly the the item.

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.1.1...v2.2.0)

## [2.1.1] - 2020-05-08

### Fixed

- Handle the issue that npm may return an empty current information for packages (thanks to Jonathan Graf for reporting this problem)

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.1.0...v2.1.1)

## [2.1.0] - 2020-05-08

### Removed

- Remove consideration of CHANGELOG.md from changes column

### Changed

- Changed the minimum required NodeJS version to v8.6.0

### Added

- Add functionality to optionally ignore a specific version of a package (e.g. to skip a broken version)
- Add new changesPreferLocal column, which behaves like the old changes column

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v2.0.0...v2.1.0)

## [2.0.0] - 2020-04-26

### Added

- Add --columns argument to hide/show and reorder the columns.
- Add new columns "Changes" (changes), "Homepage" (homepage) and "npmjs.com" (npmjs)

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v1.4.3...v2.0.0)

## [1.4.3] - 2020-03-16

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v1.4.2...v1.4.3)

## [1.4.2] - 2019-09-08

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v1.4.1...v1.4.2)

## [1.4.1] - 2019-08-30

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v1.3.0...v1.4.1)

## [1.3.0] - 2019-08-09

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v1.2.0...v1.3.0)

## [1.2.0] - 2019-08-02

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v1.1.0...v1.2.0)

## [1.1.0] - 2019-08-02

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/v1.0.1...v1.1.0)

## [1.0.1] - 2019-08-01

[Show all code changes](https://github.com/jens-duttke/check-outdated/compare/8fa4721...v1.0.1)

## [1.0.0] - 2019-08-01

Initial commit
