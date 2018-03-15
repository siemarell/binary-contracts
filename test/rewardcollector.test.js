const RewardCollector = artifacts.require('RewardCollector')

contract('Reward Collector', ([lawyer, benef]) => {
  describe('creation', () => {
    it('should create contract', async () => {
      const rewardInstance = await RewardCollector.new(
        3000,
        lawyer,
        benef
      )
      assert(rewardInstance.address)
    })

    it('should reject more than 100%', async () => {
      try {
        const rewardInstance = await RewardCollector.new(10001, lawyer, benef)
      }catch(e){
        return
      }
      assert.fail();      
      //assert(!rewardInstance.address) // home work
    })

    it('should reject negative %', async () => {
      try {
        const rewardInstance = await RewardCollector.new(-1, lawyer, benef)
      }catch(e){
        return
      }
      assert.fail();      
      //assert(!rewardInstance.address) // home work
    })
    // TODO: Другие тесты проверки результатов создания контракта
  })

  describe('execution', () => {
    let rewardInstance
    beforeEach(async () => {
      rewardInstance = await RewardCollector.new(3000, lawyer, benef)
    })

    it('should allow to send reward from layer', async () => {
      const balanceBefore = await web3.eth.getBalance(rewardInstance.address)
      assert(await rewardInstance.sendTransaction({
        value: web3.toWei(1, 'ether'),
        from: lawyer
      }))

      const balanceAfter = await web3.eth.getBalance(rewardInstance.address)
      assert.equal(balanceAfter.sub(balanceBefore).toNumber(), web3.toWei(1, 'ether'))

      assert.equal((await rewardInstance.totalyRecovered()).toNumber(), balanceAfter.toNumber())
    })

    it('should allow to withdraw laywer part', async () => {

      //Send 10 ether to contract address
      await rewardInstance.sendTransaction({
        value: web3.toWei(10, 'ether'),
        from: lawyer
      })
      const balanceBefore = await web3.eth.getBalance(lawyer)
      
      //Withdraw layer part
      const receipt = await rewardInstance.withdrawLawyer()
      assert(receipt)

      //Calculate comission
      const gasUsed = receipt.receipt.gasUsed
      const tx = await web3.eth.getTransaction(receipt.tx)
      const gasPrice = tx.gasPrice
      const comission = gasUsed * gasPrice
     
      //Check if layer got correct volume of ether
      const balanceAfter = await web3.eth.getBalance(lawyer)
      assert.equal(balanceAfter.sub(balanceBefore).toNumber(), web3.toWei(3, 'ether') - comission)
    })
  })
})