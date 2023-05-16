import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,//para usar el configService debemos de importar ConfigModule en pokemon.module.ts
  ) {
    this.defaultLimit = configService.get<number>('defaultLimit');
  console.log({defaultLimit:configService.get<number>('defaultLimit')})
  }




  async create(createPokemonDto: CreatePokemonDto) {
    // return 'This action adds a new pokemon';
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      // cuando creamos consulta en la base de datos si es unico el no y name
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      // solucion para la base datos con mensajes de error en no y name
      console.log(error)
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    // console.log("limit: ", limit, "offset: ", offset)
    return this.pokemonModel.find()
      .limit(limit)//cuantos traer
      .skip(offset)//salto
      .sort({
        no: 1
      })
      .select('-__v')
    // return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    //no 
    if (!isNaN(+term)) pokemon = await this.pokemonModel.findOne({ "no": +term })

    // mongoID
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term)
    }
    // name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ "name": term.toLowerCase().trim() })
    }
    //error
    if (!pokemon) throw new NotFoundException(`Pokemon with id name or no ${term} not found`)
    return pokemon
    // return `This action returns a #${id} pokemon`;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    try {
      await pokemon.updateOne(updatePokemonDto, { new: true }); //new:true actualizael dato y trae al nuevo
      return { ...pokemon.toJSON(), ...updatePokemonDto };

    } catch (error) {
      this.handleExceptions(error);
    }

    // return `This action updates a #${term} pokemon`;
  }

  async remove(id: string) {
    // const pokemon  = await this.findOne(id);
    // await pokemon.deleteOne();
    // return pokemon;
    // const result = await this.pokemonModel.findByIdAndDelete(id)
    const result = await this.pokemonModel.deleteOne({ _id: id });//hace busqueda y eliminado y valida en doble eliminado
    // ---resultado
    // "acknowledged": true,
    // "deletedCount": 1
    // ---
    if (result.deletedCount == 0) throw new BadRequestException(`Pokemon with id "${id}" not found`)
    return;

    // return `This action removes a #${id} pokemon`;
  }

  private handleExceptions(error: any) {
    if (error.code == 11000)
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`);
    throw new InternalServerErrorException(`Can't create pokemon -  check server logs`)

  }


}
