const chai = require('chai')
const proxyquire = require('proxyquire')
const should = chai.should()
const sinon = require('sinon')

chai.use(require('sinon-chai'))

describe('ServerlessPlugin', function () {
  beforeEach(function () {
    this.sandbox = sinon.createSandbox()

    this.requireStubs = {
      chalk: {
        red: this.sandbox.stub(),
      },
      dotenv: {
        config: this.sandbox.stub(),
      },
      dotenvExpand: this.sandbox.stub(),
      fs: {
        existsSync: this.sandbox.stub(),
      },
    }

    this.ServerlessPlugin = proxyquire('../', this.requireStubs)

    this.serverless = {
      cli: {
        log: this.sandbox.stub(),
      },
      service: {
        custom: {
          dotenv: {
            required: {},
          },
        },
        provider: {},
      },
    }
    this.options = {}

    this.plugin = new this.ServerlessPlugin(this.serverless, this.options)
  })

  afterEach(function () {
    this.sandbox.verifyAndRestore()
  })

  describe('constructor()', function () {
    it('does not err out on minimal configuration', function () {
      should.exist(this.plugin)
    })

    it('loads environment variables as expected', function () {
      const env = 'unittests'

      const getEnvironment = this.sandbox.stub(
        this.ServerlessPlugin.prototype,
        'getEnvironment',
      )
      getEnvironment.withArgs(this.options).returns(env)

      const loadEnv = this.sandbox.stub(
        this.ServerlessPlugin.prototype,
        'loadEnv',
      )

      new this.ServerlessPlugin(this.serverless, this.options)

      loadEnv.should.have.been.calledWith(env)
    })
  })

  describe('getEnvironment()', function () {})

  describe('resolveEnvFileNames()', function () {})

  describe('loadEnv()', function () {
    beforeEach(function () {
      this.env = 'unittests'
      this.resolveEnvFileNames = this.sandbox.stub(
        this.plugin,
        'resolveEnvFileNames',
      )
    })

    it('logs an error if no .env files are required and none are found', function () {
      this.resolveEnvFileNames.withArgs(this.env).returns([])

      this.plugin.loadEnv(this.env)

      this.serverless.cli.log.should.have.been.calledWith(
        'DOTENV: Could not find .env file.',
      )
    })

    it('throws an error if no .env files are required but at least one is required', function () {
      this.serverless.service.custom.dotenv.required.file = true
      this.resolveEnvFileNames.withArgs(this.env).returns([])

      should.Throw(() => this.plugin.loadEnv(this.env))
    })
  })
})
