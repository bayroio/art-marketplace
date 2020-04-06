import React from 'react'
import ReactDOM from 'react-dom'
import { MetamaskProvider } from '@0xcert/ethereum-metamask-provider'
//import { BitskiProvider } from '@0xcert/ethereum-bitski-backend-provider';
import { BitskiProvider } from '@0xcert/ethereum-bitski-frontend-provider';
import { schema88 } from '@0xcert/conventions'
import { Cert } from '@0xcert/cert'
// Assets Ledgers are groups of tokens that are managed by certain users just like mods in a chat to do what's required
// The Capabilities determine what those mods can do with the assets they are managing
// The Ethereum address that deploys this ledger has full powers to do whatever he wants as the administrator
import { AssetLedger, AssetLedgerCapability } from '@0xcert/ethereum-asset-ledger'
import './index.css'

class Main extends React.Component {
    constructor() {
        super()

        this.state = {
            provider: {},
            ledger: {},
            assets: []
        }
    }

    // Run your desired functions here
    async componentDidMount() {
        await this.setProvider()
        const newLedger = await this.deployNewLedger()
        await this.setExistingLedger(newLedger)
        await this.setAssetArray()
    }

    // To set a metamask provider
    async setProvider() {
        const provider = new MetamaskProvider()
        /*const provider = new BitskiProvider({
            clientId: '5b0f6732-c89e-4746-8e8e-987cc39f6f6d', //clientId: '5b0f6732-c89e-4746-8e8e-987cc39f6f6d',
            redirectUrl: 'http://127.0.0.1:8080/callback.html',
            //credentialsId: '3b332e0ae3874a84941010ed33cf2338', //credentialsId: '3b332e0a-e387-4a84-9410-10ed33cf2338',
            //credentialsSecret: '206OgQfwkBSjRaZ7XrFTGnO11KWUinJor7DVNUOKMEP5ZwbjkuvfqiqIQaCbzMdA', //credentialsSecret: '206OgQfwkBSjRaZ7XrFTGnO-11KWUinJor7DVNUOKMEP5ZwbjkuvfqiqIQ-aCbzMdA',
        })*/
        if (!(await provider.isEnabled())) await provider.enable()
        await this.setState({provider})
    }

    // To set the ledger as a state object
    async setExistingLedger(newLedger) {
        const ledgerAddress = newLedger
        const ledger = AssetLedger.getInstance(this.state.provider, ledgerAddress)
        await this.setState({ledger})
    }

    async setAssetArray(description, image, name, price) {
        const assets = await this.getUserBalance()
        console.log('Assets ', assets)
        let assetArray = []
        // Generate an array for each asset to create the corresponding AgroProduct components
        for(let i = 0; i < assets; i++) {
            assetArray.push(i)
        }
        console.log('Assets 1: ', assetArray)
        //assetArray = assets
        //console.log('Assets 2: ', assetArray)
        assetArray = assetArray.map(index => (
            <AgroProduct
                assetId={index}
                key={index}
                description={description}
                image={image}
                name={name}
                price={price}
            />
        ))
        console.log('Assets 3: ', assetArray)
        await this.setState({assets: assetArray})
    }

    // To get user ERC721 token balance
    async getUserBalance() {
        const balance = await this.state.ledger.getBalance(web3.eth.accounts[0])
        return balance
    }

    // To create a new asset ledger containing several assets and managed by several individuals
    // The asset ledger is mandatory to create new assets since they need a place to be stored, they can't exist without a ledger
    async deployNewLedger() {
        const cert = new Cert({
            schema: schema88
        })
        let schemaID = await cert.identify()
        console.log('schemaId ', schemaID)

        let deployedLedger = {}

        // The required keys are name, symbol, uriBase and schemaId
        const recipe = {
            name: 'Hortalizas Rain Forest',
            symbol: 'HRF',
            uriPrefix: "https://0xcert.org/assets/",
            uriPostfix: ".json",
            schemaId: schemaID,
            capabilities: [
                AssetLedgerCapability.DESTROY_ASSET,
                AssetLedgerCapability.UPDATE_ASSET,
                AssetLedgerCapability.TOGGLE_TRANSFERS,
                AssetLedgerCapability.REVOKE_ASSET
            ]
        }

        try {
            deployedLedger = await AssetLedger.deploy(this.state.provider, recipe).then(mutation => {
                console.log('Deploying new asset ledger, it may take a few minutes.')
                return mutation.complete()
            })
            console.log('Ledger ', deployedLedger)
        } catch (e) {
            console.log('Error - ', e)
        }

        if (deployedLedger.isCompleted) {
            console.log('Ledger address', deployedLedger.receiverId)
            return deployedLedger.receiverId
        }
    }

    // To deploy a new asset
    async deployCebollaBlanca() {
        const cert = new Cert({
            schema: schema88
        })
        // In your final application you'll want to dinamically generate the asset parameters to create new assets with different imprints
        const asset = {
            description: 'Cebolla blanca muy bonita y picosita para los ojos',
            image: 'http://127.0.0.1:8080/images/cebollablanca.png',
            name: 'Cebolla Blanca',
            price: '$10 la tonelada',
        }
        const imprint = await cert.imprint(asset)
        console.log('New imprint', imprint)
        const assetId = parseInt(await this.getUserBalance()) + 1
        console.log('id', assetId)
        await this.state.ledger.createAsset({
            id: assetId,
            imprint: imprint, // You must generate a new imprint for each asset
            receiverId: web3.eth.accounts[0],
            name: asset.name,
            description: asset.description,
            price: asset.price,
        }).then(mutation => {
            console.log('Creating new agro asset, this may take a while...')
            return mutation.complete()
        }).then(result => {
            console.log('Deployed!')
            this.setAssetArray(asset.description, asset.image, asset.name, asset.price) // Update the user interface to show the deployed asset
        }).catch(e => {
            console.log('Error', e)
        })
    }

    async deployTomateSaladette() {
        const cert = new Cert({
            schema: schema88
        })
        // In your final application you'll want to dinamically generate the asset parameters to create new assets with different imprints
        const asset = {
            description: 'Tomate Saladette muy rojito y ovaladito',
            image: 'http://127.0.0.1:8080/images/tomatesaladet.png',
            name: 'Tomate Saladette',
            price: '$20 la tonelada',
        }
        const imprint = await cert.imprint(asset)
        console.log('New imprint', imprint)
        const assetId = parseInt(await this.getUserBalance()) + 1
        console.log('id', assetId)
        await this.state.ledger.createAsset({
            id: assetId,
            imprint: imprint, // You must generate a new imprint for each asset
            receiverId: web3.eth.accounts[0]
        }).then(mutation => {
            console.log('Creating new agro asset, this may take a while...')
            return mutation.complete()
        }).then(result => {
            console.log('Deployed!')
            this.setAssetArray(asset.description, asset.image, asset.name, asset.price) // Update the user interface to show the deployed asset
        }).catch(e => {
            console.log('Error', e)
        })
    }

    async deployLimonPersa() {
        const cert = new Cert({
            schema: schema88
        })
        // In your final application you'll want to dinamically generate the asset parameters to create new assets with different imprints
        const asset = {
            description: 'Limón jugosito y redondito',
            image: 'http://127.0.0.1:8080/images/limonpersa.jpg',
            name: 'Limón Persa',
            price: '$30 la tonelada',
        }
        const imprint = await cert.imprint(asset)
        console.log('New imprint', imprint)
        const assetId = parseInt(await this.getUserBalance()) + 1
        console.log('id', assetId)
        await this.state.ledger.createAsset({
            id: assetId,
            imprint: imprint, // You must generate a new imprint for each asset
            receiverId: web3.eth.accounts[0]
        }).then(mutation => {
            console.log('Creating new agro asset, this may take a while...')
            return mutation.complete()
        }).then(result => {
            console.log('Deployed!')
            this.setAssetArray(asset.description, asset.image, asset.name, asset.price)  // Update the user interface to show the deployed asset
        }).catch(e => {
            console.log('Error', e)
        })
    }

    async deployGarbanzo() {
        const cert = new Cert({
            schema: schema88
        })
        // In your final application you'll want to dinamically generate the asset parameters to create new assets with different imprints
        const asset = {
            description: 'Garbanzo muy chiquito y oloroso',
            image: 'http://127.0.0.1:8080/images/garbanzo.jpg',
            name: 'Garbanzo',
            price: '$5 la tonelada',
        }
        const imprint = await cert.imprint(asset)
        console.log('New imprint', imprint)
        const assetId = parseInt(await this.getUserBalance()) + 1
        console.log('id', assetId)
        await this.state.ledger.createAsset({
            id: assetId,
            imprint: imprint, // You must generate a new imprint for each asset
            receiverId: web3.eth.accounts[0]
        }).then(mutation => {
            console.log('Creating new agro asset, this may take a while...')
            return mutation.complete()
        }).then(result => {
            console.log('Deployed!')
            this.setAssetArray(asset.description, asset.image, asset.name, asset.price)  // Update the user interface to show the deployed asset
        }).catch(e => {
            console.log('Error', e)
        })
    }

    render() {
        return (
            <div>
                <h1>CIIAN Marketplace</h1>
                <p>In this marketplace you can deploy unique agro products to the blockchain.</p>
                <div className="assets-container">{this.state.assets}</div>
                <button className="margin-right" onClick={() => { this.deployCebollaBlanca()}}>Launch Agro Product: Cebolla Blanca</button>
                <button className="margin-right" onClick={() => { this.deployTomateSaladette()}}>Launch Agro Product: Tomate Saladette</button>
                <button className="margin-right" onClick={() => { this.deployLimonPersa()}}>Launch Agro Product: Limon Persa</button>
                <button className="margin-right" onClick={() => { this.deployGarbanzo()}}>Launch Agro Product: Garbanzo</button>
                <button onClick={() => { this.setAssetArray()}}>Get All Agro Products</button>
            </div>
        )
    }
}

class AgroProduct extends React.Component {
    constructor() {
        super()
    }

    render() {
        return (
            <div className="art-container">
                <img className="art-image" src={this.props.image} width="100px" />
                <div className="art-owner">Id Producto: {this.props.assetId}</div>
                <div className="art-ower">Descripción: {this.props.description}</div>
                <div className="art-owner">Precio: {this.props.price}</div>
                <div className="art-owner">Productor: {web3.eth.accounts[0]}</div>
                <br />
            </div>
        )
    }
}

ReactDOM.render(<Main />, document.querySelector('#root'))