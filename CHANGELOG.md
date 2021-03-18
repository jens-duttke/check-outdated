# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.0] - 2021-03-14

### Added

- Added "Color legend"
- Group dependencies by their type

### Changed

- Change colorization of dependency name
- Reorder default columns
- Remove "Type" from default columns

## [2.5.1] - 2021 -02-26

### Fixed

- Remove ".git" extension from GitHub repository URLs

## [2.5.0] - 2020-12-16

### Fixed

- Sub-packages in mono-repositories on GitHub (like Gatsby) are now considered for CHANGELOG.md-link generation

## [2.4.1] - 2020-09-29

### Changed

- Improve CHANGELOG.md detection

## [2.4.0] - 2020-09-26

### Fixed

- Only link to CHANGELOG.md files on GitHub if they have content

## [2.3.2] - 2020-08-04

### Changed

- Optimize detection of item in package.json for generting the Reference link

## [2.3.1] - 2020-08-04

### Fixed

- Fix missing Reference link, if the installed package version does not match the version in the package.json

## [2.3.0] - 2020-06-24

### Added

- If a CHANGELOG.md exists in the GitHub repository, the Changes row, will link to this file, instead of the Releases page

## [2.2.0] - 2020-05-16

### Added

- Add "Reference" column, which contains a link to the line and column of the dependency in the package.json.
  By using a terminal which supports clicking on such links, you can navigate directly the the item.

## [2.1.1] - 2020-05-08

### Fixed

- Handle the issue that npm may return an empty current information for packages (thanks to Jonathan Graf for reporting this problem)

## [2.1.0] - 2020-05-08

### Added

- Add functionality to optionally ignore a specific version of a package (e.g. to skip a broken version)
- Add new changesPreferLocal column, which behaves like the old changes column

### Changed

- Changed the minimum required NodeJS version to v8.6.0

### Removed

- Remove consideration of CHANGELOG.md from changes column

## [2.0.0] - 2020-04-26

### Added

- Add --columns argument to hide/show and reorder the columns.
- Add new columns "Changes" (changes), "Homepage" (homepage) and "npmjs.com" (npmjs)

## [1.4.3] - 2020-03-16

https://github.com/jens-duttke/check-outdated/compare/v1.4.2...v1.4.3

## [1.4.2] - 2019-09-08

https://github.com/jens-duttke/check-outdated/compare/v1.4.1...v1.4.2

## [1.4.1] - 2019-08-30

https://github.com/jens-duttke/check-outdated/compare/v1.3.0...v1.4.1

## [1.3.0] - 2019-08-09

https://github.com/jens-duttke/check-outdated/compare/v1.2.0...v1.3.0

## [1.2.0] - 2019-08-02

https://github.com/jens-duttke/check-outdated/compare/v1.1.0...v1.2.0

## [1.1.0] - 2019-08-02

https://github.com/jens-duttke/check-outdated/compare/v1.0.1...v1.1.0

## [1.0.1] - 2019-08-01

https://github.com/jens-duttke/check-outdated/compare/8fa4721...v1.0.1

## [1.0.0] - 2017-06-20

Initial commit
