<p align="center">
  <a href="https://email360.io/">
    <img src="https://email360.io/img/logo_dark.84e942c8.png" alt="email360 logo" width="400" height="223">
  </a>
</p>
<p align="center">
  A sleek and powerful library for faster and easier development in Salesforce Marketing Cloud ©.
  <br>
  <br>
  <a href="https://docs.email360.io/">Explore the Docs</a>
  ·
  <a href="https://email360.io/#contact">Get in touch</a>
  ·
  <a href="https://blog.email360.io/">email360 Blog</a>
</p>


## Table of contents

- [Quick start](#quick-start)
- [What's installed](#whats-installed)
- [Documentation](#documentation)
- [Code](#code)
- [Creators](#creators)
- [Contributing](#contributing)
- [Thanks](#thanks)
- [Copyright and license](#copyright-and-license)


## Quick start

To install the Email360 ssjs-lib into your project create a Cloudpage and insert the following code:

```javascript
%%=TreatAsContent(HTTPGet('https://raw.githubusercontent.com/email360/ssjs-lib/master/setup/setup.js'))=%%
```
Now open the URL of your new Cloudpage, if you experience a timeout refresh the page.

> Details of the script that is run for installation can be found at <https://raw.githubusercontent.com/email360/ssjs-lib/master/setup/setup.js>


## What's installed

After executing the installation process you'll find the following directories and files, logically grouping common assets. 
```text
Marketing Cloud/
├── Data Extensions/
│   └── email360 SSJS Lib/
│       ├── email360 SSJS Lib - Auth Users
│       ├── email360 SSJS Lib - Authentication
│       ├── email360 SSJS Lib - Log Error
│       ├── email360 SSJS Lib - Log Warning
│       ├── email360 SSJS Lib - SFMC Api Token
│       └── email360 SSJS Lib - WSProxy Cols
└── Content Builder/
    └── email360 SSJS Lib/
        │   └── email360 SSJS Lib
        ├── CloudPages/
        │   ├── Error/
        │   │   └── email360 Error Page
        │   └── Login/
        │       └── email360 Login Page
        └── Lib/
            ├── email360 SSJS Lib - settings
            ├── email360 SSJS Lib - cloudpage
            ├── email360 SSJS Lib - amp
            ├── email360 SSJS Lib - wsproxy
            ├── email360 SSJS Lib - core
            ├── email360 SSJS Lib - polyfill
            └── email360 SSJS Lib - sfmcapi
```


## Documentation

Email360's SSJS Lib documentation can be found at <https://docs.email360.io>

## Code

Email360's SSJS Lib can be found at <https://github.com/email360/ssjs-lib>

## Creators

**Sascha Huwald**

- [LinkedIn](https://www.linkedin.com/in/sascha-huwald/)

**Colin Pringle-Wood**

- [GitHub](https://github.com/colins44)
- [LinkedIn](https://www.linkedin.com/in/colin-pringle-wood-49194053/)

## Contributing

We welcome all who want to contribute to this repository, to contribute please follow these guidelines.

1. Fork the repo and create your branch from `master`. A guide on how to fork a repository can be found [here](https://help.github.com/articles/fork-a-repo/).

2. Make your changes, test where/if possible.

3. If your changes alter the behaviour of any of the code, update the corresponding comments within the codebase. The updated comment will then be used to update the documentation found within our [docs](https://docs.email360.io)

4. Open a pull request against the `master` branch at https://github.com/email360/ssjs-lib.

5. Leave a comment on the pull request stating the reason for the change.

5. One of the administrators of `email360/ssjs-lib` will review your code, merge it or ask for changes.

## Thanks

This library would not have been possible without the [Salesforce Marketing Cloud ©](https://www.salesforce.com/products/marketing-cloud/) community. Ohana!


Special thanks to the following people for their active contribution to the community: 

**[Gregory (Gortonington) Gifford](https://www.linkedin.com/in/gregory-gortonington-gifford-238a0625/)**, 
**[Ivan Razine](https://www.linkedin.com/in/ivanrazine/)**, 
**[Adam Spriggs](https://www.linkedin.com/in/adamspriggs/)**, 
**[Zuzanna Jarczynska](https://www.linkedin.com/in/zuzannajarczynska/)**


## Copyright and license

Code and documentation copyright 2020 the email360 SSJS Lib under the [MIT License](https://github.com/email360/ssjs-lib/blob/master/LICENSE).
