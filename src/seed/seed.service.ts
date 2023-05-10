import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosAdapter } from '../common/adapters/axios.adapter';


@Injectable()
export class SeedService {

  
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  
    private readonly http: AxiosAdapter,
    ) { }

  async executeSeed() {
    await this.pokemonModel.deleteMany({}); //eliminar todos los registros
    const data  = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=123');
    // const insertPromisesArray = []; //solucion 1
    const pokemonToInsert: { name: string, no: number }[] = []; //solucion 2
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      // const pokemon = await this.pokemonModel.create({ name, no });//inserta uno por uno
      //solucion 1: inserción simultaneas
      // insertPromisesArray.push(
      //   this.pokemonModel.create({ name, no })
      // )
      // await Promise.all(insertPromisesArray);
      // solucion 2
      pokemonToInsert.push({ name, no })
    })
    await this.pokemonModel.insertMany(pokemonToInsert);
    return "seed executed"
    // return data.results;
    // return `This action returns all seed`;
  }
}
