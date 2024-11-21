<p align="center">
  This library aims at making your SSJS implementations faster, more secure and stable.
  <br><br>
  Separate version of the [SSJS Lib by Email360](https://github.com/email360/ssjs-lib) that includes some changes from the original library.
  <br>
</p>

## Quick start

To install the Email360 ssjs-lib into your project create a Cloudpage and insert the following code:

```javascript
%%=TreatAsContent(HTTPGet('https://raw.githubusercontent.com/FiB3/ssjs-lib/refs/heads/master/setup/setup.ssjs'))=%%
```
<br/>
The following video (by Email360) for a full guide on the installation of the SSJS Library.<br/>

[![Instal the SSJS LIB](https://img.youtube.com/vi/0ErmyPvmVVM/0.jpg)](https://www.youtube.com/watch?v=0ErmyPvmVVM)

<br>
It is also possible to install this library manually by manully copying the required resources to your SFMC instance (Data Extensions, Content Blocks with the lib, creating keys).
<br><br>

After the installation add the following code at the top of your script to get started. 
Change the prefix and version as desired. Default is email360 and version 1.0.1
<!-- TODO: include individual loaders: -->
```javascript
    Platform.Load("Core", "1");
    Platform.Function.ContentBlockByKey('[prefix]-ssjs-lib-[version]');
```

<br>

## What's installed

After executing the installation process you'll find the following directories and files, logically grouping common assets. 
```text
Marketing Cloud/
├── Data Extensions/
│   └── SSJS Lib/
│       ├── SSJS Lib - Auth Users - [VERSION]_[BRAND NAME]
│       ├── SSJS Lib - Authentication - [VERSION]_[BRAND NAME]
│       ├── SSJS Lib - Log Error - [VERSION]_[BRAND NAME]
│       ├── SSJS Lib - Log Warning - [VERSION]_[BRAND NAME]
│       ├── SSJS Lib - SFMC Api Token - [VERSION]_[BRAND NAME]
│       └── SSJS Lib - WSProxy Cols - [VERSION]_[BRAND NAME]
│
└── Content Builder/
    └── SSJS Lib/
      ├── CloudPages/
      │   ├── Error Page
      │   └── Login Page
      └── Lib/
          ├── SSJS Lib - settings
          ├── SSJS Lib - standard
          ├── SSJS Lib - cloudpage
          ├── SSJS Lib - amp
          ├── SSJS Lib - wsproxy
          ├── SSJS Lib - core
          ├── SSJS Lib - polyfill
          ├── SSJS Lib - einstein
          └── SSJS Lib - sfmcapi
```

<br/>

## Changelog

Notable changes will be included in `Changelog.md`.

This section will focus on main changes and additions against the original library:




- All polyfills are included as optional, as these break standard SSJS functions.
- `Standard` lib is implemented and it contains replacements for all the polyfills (in lodash style).
<!-- - simplified folder structure. -->
<!-- - conditional import of the libraries -->
<!-- - unit tests library -->
<!-- - update mechanism for code -->

## Documentation

Email360's SSJS Lib documentation can be found at <https://docs.email360.io><br/>
For any tips and tricks please head over to the [email360 youtube channel](https://www.youtube.com/channel/UCCo1dWV3E3WipnqhOKynfGg)

<br/>

## Code

Email360's SSJS Lib can be found at <https://github.com/FiB3/ssjs-lib>

Email 360 Youtube channel for some guides: <a href="https://www.youtube.com/channel/UCCo1dWV3E3WipnqhOKynfGg">email360 Youtube</a>


<br/>

## Contributing

We welcome all who want to contribute to this repository, to contribute please follow these guidelines.

1. Fork the repo and create your branch from `master`.

2. Make your changes, test where/if possible. Use JSDoc strings to document all functions.

3. If your changes alter the behaviour of any of the code, update the corresponding comments within the codebase. The updated comment will then be used to update the documentation found within our [docs](https://docs.email360.io)

4. Open a pull request against the `master` branch at https://github.com/email360/ssjs-lib.

5. Leave a comment on the pull request stating the reason for the change.

5. One of the administrators of `email360/ssjs-lib` will review your code, merge it or ask for changes.

<br/>

## Copyright and licence

Code and documentation copyright 2020 the email360 SSJS Lib and 2024 by FiB under the [MIT License](https://github.com/email360/ssjs-lib/blob/master/LICENSE).