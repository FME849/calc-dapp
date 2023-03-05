import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { BN } from "bn.js";
import { expect, assert } from "chai";
import { Calculator } from "../target/types/calculator";

const {SystemProgram} = anchor.web3

describe("calculator", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  // Referencing the program - Abstraction that allow us to call methods of our SOL program
  const program = anchor.workspace.Calculator as Program<Calculator>;
  const programProvider = program.provider as anchor.AnchorProvider; 

  // Generating a Keypair for our Calculator account
  const calculatorPair = anchor.web3.Keypair.generate(); 

  const text = "Summer School of Solana";

  // Creating a test block
  it("Creating Calculator Instance", async ()=> {
    // Calling create instance - Set our instance Keypair as a signer
    await program.methods.create(text).accounts({
      calculator: calculatorPair.publicKey,
      user: programProvider.wallet .publicKey,
      systemProgram: SystemProgram.programId,
    }).signers([calculatorPair]).rpc();

    // We fetch the account and read if the string is actually in the account
    const account = await program.account.calculator.fetch(calculatorPair.publicKey); 
    expect(account.greeting).to.eql(text);
  })

  it ("Addition testing",async () => {
    await program.methods.add(new BN(3), new BN(9)).accounts({
      calculator: calculatorPair.publicKey,
    }).rpc();

    const account = await program.account.calculator.fetch(calculatorPair.publicKey); 
    expect(account.result).to.eql(new BN(12))
  })

  it ("Subtraction testing",async () => {
    await program.methods.sub(new BN(3), new BN(9)).accounts({
      calculator: calculatorPair.publicKey,
    }).rpc();

    const account = await program.account.calculator.fetch(calculatorPair.publicKey); 
    expect(account.result).to.eql(new BN(-6))
  })

  it ("Multiplication testing",async () => {
    await program.methods.multiply(new BN(3), new BN(9)).accounts({
      calculator: calculatorPair.publicKey,
    }).rpc();

    const account = await program.account.calculator.fetch(calculatorPair.publicKey); 
    expect(account.result).to.eql(new BN(27))
  })

  it ("Division testing",async () => {
    await program.methods.division(new BN(9), new BN(3)).accounts({
      calculator: calculatorPair.publicKey,
    }).rpc();

    const account = await program.account.calculator.fetch(calculatorPair.publicKey); 
    expect(account.result).to.eql(new BN(3))
  })

  it('Expects Error', async () => {
    try {
          const account = await program.methods.division(new BN(3), new BN(0)).accounts({
            calculator: calculatorPair.publicKey,
          }).rpc();
        } catch (_err) {
          assert.isTrue(_err instanceof AnchorError);
          const err: AnchorError = _err;
          const errMsg = "Can not divide by zero";
          assert.strictEqual(err.error.errorMessage, errMsg);
        }
});

});
