import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto, UpdateCategoryDto } from "../dto/category.dto";

@Injectable()
export class CategoryService {
	constructor(private prisma: PrismaService) {}

	async create(createCategoryDto: CreateCategoryDto) {
		return this.prisma.category.create({
			data: createCategoryDto,
		});
	}

	async findAll() {
		return this.prisma.category.findMany();
	}

	async findOne(id: string) {
		return this.prisma.category.findUnique({
			where: { id },
		});
	}

	async update(id: string, updateCategoryDto: UpdateCategoryDto) {
		return this.prisma.category.update({
			where: { id },
			data: updateCategoryDto,
		});
	}

	async remove(id: string) {
		return this.prisma.category.delete({
			where: { id },
		});
	}
}
