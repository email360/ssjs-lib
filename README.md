<p align="center">
  <a href="https://email360.io/">
    <img src="https://blog.email360.io/images/logo_dark.png" alt="email360 logo" width="400" height="223">
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
  .
  <a href="https://www.youtube.com/channel/UCCo1dWV3E3WipnqhOKynfGg">email360 Youtube</a>
</p>

<br/>

## Support
<p>
  This library is open source and free to use for the community. If you find this library helpful and want to support me, please feel free to grab me a coffee for the late night grinds. Your support is greatly appreciated.

  <a href='https://ko-fi.com/N4N3BP9OD' target="_blank"><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi2.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
</p>

<br/>

## Table of contents

- [Quick start](#quick-start)
- [What's installed](#whats-installed)
- [Changelog](#changelog)
- [Documentation](#documentation)
- [Code](#code)
- [Contributing](#contributing)
- [Thanks](#thanks)
- [Copyright and licence](#copyright-and-licence)

<br/>

## Quick start

To install the Email360 ssjs-lib into your project create a Cloudpage and insert the following code:

```javascript
%%=TreatAsContent(HTTPGet('https://raw.githubusercontent.com/email360/ssjs-lib/master/setup/setup.ssjs'))=%%
```
<br/>
Please watch the following video for a full guide on the installation of the SSJS Library.<br/>

[![Instal the SSJS LIB](https://img.youtube.com/vi/0ErmyPvmVVM/0.jpg)](https://www.youtube.com/watch?v=0ErmyPvmVVM)


All steps are optional and if you experience a timeout refresh the page.

> Details of the script that is run for installation can be found at <https://raw.githubusercontent.com/email360/ssjs-lib/master/setup/setup.ssjs>

<br><br>
After the installation add the following code at the top of your script to get started. 
Change the prefix and version as desired. Default is email360 and version 1.0.1
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
│   └── [BRAND NAME]/
│       └── SSJS Lib/
│           └── [VERSION]
│                 ├── SSJS Lib - Auth Users - [VERSION]_[BRAND NAME]
│                 ├── SSJS Lib - Authentication - [VERSION]_[BRAND NAME]
│                 ├── SSJS Lib - Log Error - [VERSION]_[BRAND NAME]
│                 ├── SSJS Lib - Log Warning - [VERSION]_[BRAND NAME]
│                 ├── SSJS Lib - SFMC Api Token - [VERSION]_[BRAND NAME]
│                 └── SSJS Lib - WSProxy Cols - [VERSION]_[BRAND NAME]
│
└── Content Builder/
    └── [BRAND NAME]/
        └── SSJS Lib/
            └── [VERSION]
                  ├── CloudPages/
                  │   ├── Error/
                  │   │   └── Error Page
                  │   └── Login/
                  │       └── Login Page
                  └── Lib/
                      ├── SSJS Lib - settings
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
<details>
  <summary>Version 1.01</summary>
  
  1. Introducing versions. Versions will be added to customer keys and DataExtension names. This will allow you to install newer versions of the library without any possible issues on existing code due to backward compatibility.
  2. Added JWT support. A new `script` has been added: `var jwt = new jwt();`
      * jwt.encode();
      * jwt.decode();
      * jwt.verify();
  3. Introducing log4ssjs to the SSJS library. Similar to log4js but different...
      * `var log = new logger('name')`;
      * `log.level = "DEBUG"`;
      * Additionally you can set appenders. 
        * `log.configure =  {appenders:[ {type:"dataExtension",level:"INFO"}, {type:"console",level:"TRACE"}]}`
      * Currently supported
        * console    
        * json
        * html
        * DataExtension
        * HTTPRequest
        * TriggeredSend
  4. Removed script tags from library files for better lint support in vs-code
  5. Introduce a setup wizard to assist with installation
</details>

<br/>

## Documentation

Email360's SSJS Lib documentation can be found at <https://docs.email360.io><br/>
For any tips and tricks please head over to the [email360 youtube channel](https://www.youtube.com/channel/UCCo1dWV3E3WipnqhOKynfGg)

<br/>

## Code

Email360's SSJS Lib can be found at <https://github.com/email360/ssjs-lib>


<br/>

## Contributing

We welcome all who want to contribute to this repository, to contribute please follow these guidelines.

1. Fork the repo and create your branch from `master`. A guide on how to fork a repository can be found [here](https://help.github.com/articles/fork-a-repo/).

2. Make your changes, test where/if possible.

3. If your changes alter the behaviour of any of the code, update the corresponding comments within the codebase. The updated comment will then be used to update the documentation found within our [docs](https://docs.email360.io)

4. Open a pull request against the `master` branch at https://github.com/email360/ssjs-lib.

5. Leave a comment on the pull request stating the reason for the change.

5. One of the administrators of `email360/ssjs-lib` will review your code, merge it or ask for changes.

<br/>

## Thanks

This library would not have been possible without the [Salesforce Marketing Cloud ©](https://www.salesforce.com/products/marketing-cloud/) community. Ohana!

Special thanks to the following people for their active contribution to the community: 

**[Ivan Razine](https://www.linkedin.com/in/ivanrazine/)**, 
**[Adam Spriggs](https://www.linkedin.com/in/adamspriggs/)**, 
**[Zuzanna Jarczynska](https://www.linkedin.com/in/zuzannajarczynska/)**,
**[Eliot Harper](https://www.linkedin.com/in/eliot/)**,
**[Mateusz Dąbrowski](https://www.linkedin.com/in/mateusz-dabrowski-marketing/)**,
**[Gregory (Gortonington) Gifford](https://www.linkedin.com/in/gregory-gortonington-gifford-238a0625/)**

<br/>

## Copyright and licence

Code and documentation copyright 2020 the email360 SSJS Lib under the [MIT License](https://github.com/email360/ssjs-lib/blob/master/LICENSE).
