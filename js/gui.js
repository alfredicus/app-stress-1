
function generateGUI() {

    const upload = document.getElementById('upload')
    upload.onchange = () => {
        upload.files[0].arrayBuffer().then(arrayBuffer => {
            const lines = new TextDecoder().decode(arrayBuffer).split('\n')
            
            for (let i = 1; i < lines.length; ++i) {
                const line = stress.trimAll(lines[i].trim())
                if (line.length === 0) {
                    continue
                }
                
                // const toks = line.split(';').filter( v => v.length!==0).map( s => s.replace(',', '.'))
                const toks = line.split(';').map( s => s.replace(',', '.'))
                if (toks.length === 0) {
                    continue
                }

                const data = stress.DataFactory.create(toks[1])
                if (data === undefined) {
                    alert(`Unknown data type "${toks[1]}" for data id ${toks[0]}`)
                    continue
                }

                const result = data.initialize([toks])
                if (result.status === false) {
                    result.messages.forEach( msg => console.log(msg) )
                    alert('An error occured. Read the console.')
                }
            }
        })
    }

    const GUI = lil.GUI
    const parent = document.getElementById('menu')
    const gui = new GUI({ container: parent })

    const myObject = {
        loadData: function () {
            document.getElementById('upload').click()
        },
        clearData: function () {

        },
        attribute: 'x',

        sigma1: 1,
        sigma2: 0,
        sigma3: 0,

        run: function () {
            changeSigma(1, 2, 3)
        }
    }

    // ---------------------------------

    const stressTensor = new stress.StressTensor({
        trendS1 : 0, 
        plungeS1: 0, 
        trendS3 : 0, 
        plungeS3: 0, 
        masterStress: 'σ1'
    })

    const tensor = {
        master      : 'σ1',
        trendMaster : 0,
        plungeMaster: 0,
        trendSlave  : 0,
        plungeSlave : 0
    }
    const tensorFolder = gui.addFolder('Stress tensor orientation')

    function updateStressTensor() {
        tensor.plungeSlave = stressTensor.plunge
    }

    tensorFolder.add(tensor, 'master', ['σ1', 'σ3']).name('Master principal stress').onChange( value => {
        tm.name(`    Trend ${value}`)
        pm.name(`    Plunge ${value}`)
        if (value === 'σ1') {
            ts.name(`    Trend σ3`)
            ps.name(`    Plunge σ3`)
        }
        else {
            ts.name(`    Trend σ1`)
            ps.name(`    Plunge σ1`)
        }
        stressTensor.changeMasterStress(value)
        updateStressTensor()
    })
    const tm = tensorFolder.add(tensor, 'trendMaster', 0, 360, 1).name('    Trend σ1').onChange( v => {
        if (tensor.master === 'σ1') {
            stressTensor.trendS1 = v
        }
        else {
            stressTensor.trendS3 = v
        }
        updateStressTensor()
    })
    const pm = tensorFolder.add(tensor, 'plungeMaster', -90, 90, 1).name('    Plunge σ1').onChange( v => {
        if (tensor.master === 'σ1') {
            stressTensor.plungeS1 = v
        }
        else {
            stressTensor.plungeS3 = v
        }
        updateStressTensor()
    })
    const ts = tensorFolder.add(tensor, 'trendSlave', 0, 360, 1).name('    Trend σ3').onChange( v => {
        if (tensor.master === 'σ1') {
            stressTensor.trendS3 = v
        }
        else {
            stressTensor.trendS1 = v
        }
        updateStressTensor()
    })
    const ps = tensorFolder.add(tensor, 'plungeSlave').name('    Plunge σ3').disable().listen()

    // ---------------------------------

    let mohrCoulombBuilder   = new stress.MohrCoulombCurve  ([-myObject.sigma1, -myObject.sigma3, -myObject.sigma2], 1.001)

    const mc = {
        visible  : true,
        lineWidth: 0.005,
        cohesion : 0,
        frictionAngle : 0
    }

    function rebuildMohrCoulombCurves() {
        mohrCoulombs.clear()
        if (mc.visible) {
            const buffer = mohrCoulombBuilder.generate(mc.frictionAngle, mc.cohesion)
            const lines = createLineFromPl(buffer, color = '#FF0000', mc.lineWidth)
            lines.forEach( line => mohrCoulombs.add(line) )
        }
    }

    function redrawMohrCircle() {
        mohrCircle({ element: "mohr", width: 150, height: 150, S1: myObject.sigma1, S2: myObject.sigma2, S3: myObject.sigma3, scale: 50 })
        console.log(myObject.sigma1, myObject.sigma2, myObject.sigma3)
    }

    // ---------------------------------

    const guiMC = gui.addFolder('Mohr Coulomb')
    
    guiMC.add(mc, "visible").onChange( value => {
        rebuildMohrCoulombCurves()
    })  
    guiMC.add(mc, 'frictionAngle', 0, 45, 1).name('Friction angle').onChange( value => {
        mc.frictionAngle = value
        const maxCohe = mohrCoulombBuilder.maxCohesion(mc.frictionAngle)
        if (mc.cohesion > maxCohe) {
            mc.cohesion = maxCohe
        }
        rebuildMohrCoulombCurves()
    }).listen()

    guiMC.add(mc, 'cohesion', 0, 0.5, 0.01).name('Cohesion').onChange( value => {
        mc.cohesion = value
        const maxFric = mohrCoulombBuilder.maxFrictionAngle(mc.cohesion)
        if (mc.frictionAngle > maxFric) {
            mc.frictionAngle = maxFric
        }
        rebuildMohrCoulombCurves()
    }).listen()

    // ---------------------------------

    const data = gui.addFolder('Data')
    data.add(myObject, 'loadData').name('Load') // Button
    data.add(myObject, 'clearData').name('clear') // Button
    data.close()

    // ---------------------------------

    const run = gui.addFolder('Simulation')
    run.add(myObject, 'run').name('run')
    run.close()
}
